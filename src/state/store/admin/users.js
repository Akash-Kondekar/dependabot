import { action, makeObservable, computed } from "mobx";
import { v4 as uuid } from "uuid";
import BaseStore from "../base";
import http from "../../../lib/http";
import User from "../../model/admin/user";
import { CONTACT_ADMIN_MESSAGE, STATUS_FILTER } from "../../../constants";
import events from "../../../lib/events";
import UserFilters from "../../model/admin/usersFilters";
import Client from "../../model/admin/clients/list";
import { ShowError } from "../../../components/Common";

const STAGGER_ID = uuid();

export const INITIAL_FILTER_STATE = {
    clients: [],
    roles: [],
    status: STATUS_FILTER.ALL,
    term: "",
};
export class Users extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            load: action,
            update: action,
            busy: computed,
            setLoading: action,
            setList: action,
            setClientList: action,
            setAllClientDetailsFetched: action,
            delete: action,
            restore: action,
            invite: action,
            setUploadedResults: action,
            setFilters: action,
            resetResults: action,
            resetFilters: action,
            resetAllClientFetched: action,
        });

        events.on("users.load", this.load.bind(this));
        events.on("client.changed", this.resetAllClientFetched.bind(this));
    }

    observable() {
        return {
            list: [],
            listOfClients: [],
            loading: false,
            uploadedResults: {
                invited: [],
                skipped: [],
                invalid: [],
            },
            filters: INITIAL_FILTER_STATE,
            allClientDetailsFetched: false,
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    setList(list) {
        this.list = list;
    }

    setClientList(listOfClients) {
        this.listOfClients = listOfClients;
    }

    setAllClientDetailsFetched(status) {
        this.allClientDetailsFetched = status;
    }

    resetAllClientFetched() {
        this.allClientDetailsFetched = false;
    }

    setUploadedResults(list) {
        this.uploadedResults = list;
    }

    setFilters(filters) {
        this.filters = filters;
    }

    resetResults() {
        this.uploadedResults = {
            invited: [],
            skipped: [],
            invalid: [],
        };
    }

    resetFilters() {
        this.filters = INITIAL_FILTER_STATE;
    }

    get busy() {
        return this.loading;
    }

    async load() {
        try {
            this.setLoading(true);

            const { clients = "", roles = "", status = 2, term = "" } = this.filters;

            let url = `admin/users?clientId=${clients.toString()}&role=${roles.toString()}&userstatus=${status}`;

            if (term.trim() !== "") {
                url = `${url}&term=${term.trim()}`;
            }

            const { data } = await http.get(url);

            const res = data.data?.userDetails?.map(entry => {
                return new User(entry);
            });

            this.setList(res);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async update(payload) {
        try {
            this.setLoading(true);
            await http.put("admin/users", payload).stagger(STAGGER_ID);

            this.load();
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

    async delete(userId) {
        try {
            this.setLoading(true);
            await http.delete(`admin/users/${userId}`).stagger(STAGGER_ID);

            this.load();
            return true;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async restore(userId) {
        try {
            this.setLoading(true);
            await http.put(`admin/users/${userId}/restore`).stagger(STAGGER_ID);

            this.load();
            return true;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async invite(payload, clientId, type) {
        try {
            this.setLoading(true);
            let url = `admin/client/${clientId}/invite`;

            if (type === "Upload") {
                url = `${url}/upload`;
            }

            const { data } = await http.post(url, payload).stagger(STAGGER_ID);

            const res = data?.data ?? {};
            this.setUploadedResults(new UserFilters(res));
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

    async loadAllClients() {
        try {
            this.setLoading(true);
            //Passing rows as zero to get all clients.
            const url = "admin/clients?rows=0";
            const { data } = await http.get(url).stagger(STAGGER_ID);

            const clients = data.data.clientsDetails.map(entry => {
                const newEntry = {
                    ...entry,
                    startDate: entry.startdt,
                    endDate: entry.enddt,
                };
                delete newEntry.startdt;
                delete newEntry.enddt;
                return new Client(newEntry);
            });

            this.setClientList(clients);
            this.setAllClientDetailsFetched(true);
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

export default new Users();
