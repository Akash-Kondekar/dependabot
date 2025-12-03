import { action, makeObservable, computed } from "mobx";
import BaseStore from "../base";
import http from "../../../lib/http";
import session from "../session";
import { CONTACT_ADMIN_MESSAGE } from "../../../constants";
import { ShowError } from "../../../components/Common";

export class Documents extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            busy: computed,
            setLoading: action,
            getDocument: action,
            setDocument: action,
        });
    }

    observable() {
        return {
            loading: false,
            document: "",
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    get busy() {
        return this.loading;
    }

    setDocument(data) {
        this.document = data;
    }

    async getDocument(documentId) {
        const loggedInUser = session.loggedInUser;

        //If its admin, skip this and call getClientDetailByProjectId

        if (!loggedInUser) {
            return;
        }

        try {
            this.setLoading(true);

            const { data } = await http.get(`document/${documentId}`);

            if (data.data) {
                this.setDocument(new Document(data.data));
            }
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }
}

export default new Documents();
