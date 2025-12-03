import { makeObservable, action } from "mobx";
import BaseStore from "../base";
import AHD from "../../model/codebuilder/ahd/ahd-codes";
import { v4 as uuid } from "uuid";
import http from "../../../lib/http";
import { CONTACT_ADMIN_MESSAGE } from "../../../constants";
import session from "../session";
import { ShowError } from "../../../components/Common";

const STAGGER_ID = uuid();

export class AHDStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            load: action,
            setLoading: action,
            setList: action,
        });
    }

    observable() {
        return {
            list: [],
            loading: false,
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    setList(list) {
        this.list = list;
    }

    async load() {
        try {
            this.setLoading(true);
            const { data } = await http
                .get(`/ahdcodes?user=${session.loggedInUser}`)
                .stagger(STAGGER_ID);

            const result = data.data?.map(entry => {
                return new AHD(entry);
            });

            this.setList(result);
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

export default new AHDStore();
