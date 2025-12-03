import { action, makeObservable, computed } from "mobx";
import { v4 as uuid } from "uuid";
import BaseStore from "./base";
import http from "../../lib/http";
import Publication from "../model/admin/publication";
import { ShowError } from "../../components/Common";

const STAGGER_ID = uuid();

export class Publications extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            load: action,
            busy: computed,
            setLoading: action,
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

    get busy() {
        return this.loading;
    }

    async load() {
        try {
            this.setLoading(true);
            let { data } = await http.get("/publications").stagger(STAGGER_ID);

            this.list = data.data.publicationDetails.map(entry => {
                return new Publication(entry);
            });
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

export default new Publications();
