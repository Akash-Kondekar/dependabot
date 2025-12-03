import { makeObservable, action } from "mobx";
import BaseStore from "../base";

import { v4 as uuid } from "uuid";
import http from "../../../lib/http";
import { ShowError } from "../../../components/Common";
const STAGGER_ID = uuid();

export class RegisterUserStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            register: action,
            setLoading: action,
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

    async register(payload) {
        try {
            this.setLoading(true);

            const { data } = await http.post(`users/register`, payload).stagger(STAGGER_ID);

            const result = data.data;

            return result;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(
                    error.errorDesc ||
                        "Something went wrong. Please Connect with the Administrator."
                );
            }
        } finally {
            this.setLoading(false);
        }
    }
}

export default new RegisterUserStore();
