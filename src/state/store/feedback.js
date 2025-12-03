import { action, makeObservable, computed } from "mobx";
import BaseStore from "./base";
import http from "../../lib/http";
import { CONTACT_ADMIN_MESSAGE } from "../../constants";
import { ShowError } from "../../components/Common";
export class Feedback extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            busy: computed,
            setLoading: action,
            save: action,
        });
    }

    observable() {
        return {
            loading: false,
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    get busy() {
        return this.loading;
    }

    async save(payload) {
        try {
            this.setLoading(true);
            await http.post("/user/feedback", payload);
            return true;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);

                return false;
            }
        } finally {
            this.setLoading(false);
        }
    }
}

export default new Feedback();
