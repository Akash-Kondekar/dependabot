import { makeObservable, action } from "mobx";
import BaseStore from "../base";

import { v4 as uuid } from "uuid";
import http from "../../../lib/http";
import { CONTACT_ADMIN_MESSAGE } from "../../../constants";
import { ShowError } from "../../../components/Common";

const STAGGER_ID = uuid();

export class SystemConfigurationStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, { load: action, save: action, setLoading: action, setData: action });
    }

    observable() {
        return { data: "false", loading: false, status: null };
    }

    setLoading(status) {
        this.loading = status;
    }

    setData(data) {
        this.data = data;
    }

    async load() {
        try {
            this.setLoading(true);

            let response = await http.get("/design-status").stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data;

            this.setData(result);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async save(request) {
        if (!request) {
            return;
        }

        try {
            this.setLoading(true);

            const response = await http.put("/admin/design-status", request).stagger(STAGGER_ID);
            const { data } = response;
            const result = data.data;

            this.setData(result);
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

export default new SystemConfigurationStore();
