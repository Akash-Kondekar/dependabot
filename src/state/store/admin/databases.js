import { action, makeObservable, computed } from "mobx";
import { v4 as uuid } from "uuid";
import BaseStore from "../base";
import http from "../../../lib/http";
import Database from "../../model/admin/database";
import { CURRENT_DATE } from "../../../constants";
import { formatDate } from "../../../utils";
import { ShowError } from "../../../components/Common";

const STAGGER_ID = uuid();

const INITIAL_STATE = {
    name: "",
    description: "",
    startDate: formatDate(CURRENT_DATE, "yyyy-MM-dd"),
    endDate: formatDate(CURRENT_DATE, "yyyy-MM-dd"),
    version: "",
    submission: true,
    extraction: true,
    documentid: null,
};

export class Databases extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            load: action,
            add: action,
            setLoading: action,
            setDatabases: action,
            remove: action,
            restore: action,
            set: action,
            reset: action,
            update: action,
            busy: computed,
        });
    }

    observable() {
        return {
            loading: false,
            list: [],
            database: INITIAL_STATE,
        };
    }

    set(database) {
        this.database = database;
    }

    reset() {
        this.database = INITIAL_STATE;
    }

    setLoading(status) {
        this.loading = status;
    }

    setDatabases(list) {
        this.list = list;
    }

    get busy() {
        return this.loading;
    }

    async load() {
        try {
            this.setLoading(true);
            let { data } = await http.get("admin/databases").stagger(STAGGER_ID);

            const databases = data.data.dbDetails.map(entry => {
                return new Database(entry);
            });
            this.setDatabases(databases);
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

    async add(payload) {
        try {
            this.setLoading(true);
            const { data } = await http.post("admin/databases", payload).stagger(STAGGER_ID);

            const databases = data.data ? [...this.list, new Database(data.data)] : this.list;
            this.setDatabases(databases);

            return true;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(
                    error.errorDesc ||
                        "Something went wrong. Please Connect with the Administrator."
                );
                return false;
            }
        } finally {
            this.setLoading(false);
        }
    }

    async update(payload) {
        try {
            this.setLoading(true);
            const { data } = await http
                .put(`admin/databases/${this.database.id}`, payload)
                .stagger(STAGGER_ID);

            const target = this.list.findIndex(db => db.id === this.database.id);
            this.list[target] = new Database(data.data);
            return true;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(
                    error.errorDesc ||
                        "Something went wrong. Please Connect with the Administrator."
                );
                return false;
            }
        } finally {
            this.setLoading(false);
        }
    }

    async remove(identifier) {
        try {
            this.setLoading(true);

            const { data } = await http.delete("admin/databases/" + identifier).stagger(STAGGER_ID);

            const target = this.list.findIndex(db => db.id === identifier);
            this.list[target] = new Database(data.data);
            return true;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(
                    error.errorDesc ||
                        "Something went wrong. Please Connect with the Administrator."
                );
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async restore(identifier) {
        try {
            this.setLoading(true);

            const { data } = await http
                .put(`admin/databases/${identifier}/restore`)
                .stagger(STAGGER_ID);

            const target = this.list.findIndex(db => db.id === identifier);
            this.list[target] = new Database(data.data);
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

export default new Databases();
