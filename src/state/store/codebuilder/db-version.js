// common/dbversion

import { action, makeObservable } from "mobx";
import BaseStore from "../base";

import { v4 as uuid } from "uuid";
import http from "../../../lib/http";
import { CONTACT_ADMIN_MESSAGE } from "../../../constants";
import { ShowError } from "../../../components/Common";

const STAGGER_ID = uuid();

class DBVersionStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
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

    async getDBVersion(versionDate, dbNames = [], type = "MEDICAL") {
        // versionDate = modifiedOn

        if (!versionDate) {
            return;
        }

        try {
            this.setLoading(true);

            const { data } = await http
                .get(
                    `/common/dbversion?tableType=${type}&date=${versionDate}&dbnames=${dbNames.join()}`
                )
                .stagger(STAGGER_ID);

            return data.data;
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

export default new DBVersionStore();
