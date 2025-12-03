import { action, computed, makeObservable, toJS } from "mobx";
import BaseStore from "../base";

import { v4 as uuid } from "uuid";
import http from "../../../lib/http";
import events from "../../../lib/events";

import { CONTACT_ADMIN_MESSAGE } from "../../../constants";
import session from "../session";
import { ShowError } from "../../../components/Common";

const STAGGER_ID = uuid();

class CodeBuilderCommonStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            setLoading: action,
            reset: action,
            setUserDatabases: action,
            setUserDatabasesFetched: action, // This flag controls API call
            busy: computed,
        });
        events.on("auth.logout", this.reset.bind(this));
    }

    observable() {
        return {
            loading: false,
            userDatabases: [],
            userDatabasesFetched: false,
        };
    }

    reset() {
        this.userDatabases = [];
        this.userDatabasesFetched = false;
    }

    setLoading(status) {
        this.loading = status;
    }

    get busy() {
        return this.loading;
    }

    setUserDatabases(dbs) {
        if (!dbs) {
            dbs = [];
        }
        this.userDatabases = dbs;
    }

    setUserDatabasesFetched(value) {
        this.userDatabasesFetched = value;
    }

    getUserDatabasesPlain() {
        return toJS(this.userDatabases);
    }

    async getDatabasesFor(userId) {
        if (!userId) {
            userId = session.loggedInUser;
        }

        try {
            this.setLoading(true);

            const { data } = await http.get(`/user/databases`).stagger(STAGGER_ID);

            const databases = data.data;
            this.setUserDatabasesFetched(true); // So that another API call will not happen
            if (!databases || databases.length === 0) {
                this.setUserDatabases([]);
                return;
            }

            this.setUserDatabases(
                databases.map(item => {
                    return {
                        name: item,
                        value: item,
                        label: item,
                    };
                })
            );
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

export default new CodeBuilderCommonStore();
