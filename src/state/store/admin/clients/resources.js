import { action, makeObservable, computed } from "mobx";
import { v4 as uuid } from "uuid";
import BaseStore from "../../base";
import http from "../../../../lib/http";
import ClientResource from "../../../model/admin/clients/resource";
import events from "../../../../lib/events";
import { CURRENT_DATE, CONTACT_ADMIN_MESSAGE } from "../../../../constants";
import { formatDate } from "../../../../utils";
import ClientDatabase from "../../../model/admin/clients/clientDatabase";
import { ShowError } from "../../../../components/Common";

const STAGGER_ID = uuid();

const INITIAL_STATE = [
    {
        databaseName: "",
        startDate: formatDate(CURRENT_DATE, "yyyy-MM-dd"),
        endDate: formatDate(CURRENT_DATE, "yyyy-MM-dd"),
    },
];

export class Resources extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            load: action,
            add: action,
            setLoading: action,
            setActiveDb: action,
            delete: action,
            get: action,
            setClientDatabase: action,
            busy: computed,
            reset: action,
            update: action,
        });
    }

    observable() {
        return {
            loading: false,
            activeDatabases: [],
            clientDatabases: [],
        };
    }

    reset() {
        this.clientDatabases = INITIAL_STATE;
    }

    setLoading(status) {
        this.loading = status;
    }

    setActiveDb(active) {
        this.activeDatabases = active;
    }

    setClientDatabase(database) {
        this.clientDatabases = database;
    }

    get busy() {
        return this.loading;
    }

    async load() {
        try {
            this.setLoading(true);
            const { data } = await http.get("admin/active-databases").stagger(STAGGER_ID);

            if (data.data?.dbDetails !== undefined) {
                const databases = data.data.dbDetails.map(entry => {
                    const newEntry = {
                        ...entry,
                        databaseId: entry?.id,
                        databaseName: entry?.name,
                        databaseStartDate: entry?.startdt,
                        databaseEndDate: entry?.enddt,
                        databaseVersion: entry?.version,
                        databaseDescription: entry?.description,
                        databaseDeleted: entry?.deleted,
                    };
                    delete entry.id;
                    delete entry.name;
                    delete entry.version;
                    delete entry.startdt;
                    delete entry.enddt;
                    delete entry.deleted;

                    return new ClientDatabase(newEntry);
                });
                this.setActiveDb(databases);
            } else {
                this.setActiveDb([]);
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

    async get(clientId) {
        try {
            this.setLoading(true);
            const { data } = await http
                .get(`admin/client/${clientId}/databases`)
                .stagger(STAGGER_ID);
            if (data.data?.databases !== undefined) {
                const databases = data.data.databases.map(entry => {
                    const newEntry = {
                        ...entry,
                        databaseStartDate: entry.databaseStartdt,
                        databaseEndDate: entry.databaseEnddt,
                        clientDatabaseStartDate: entry.clientDatabaseStartdt,
                        clientDatabaseEndDate: entry.clientDatabaseEnddt,
                    };
                    delete newEntry.clientDatabaseStartdt;
                    delete newEntry.clientDatabaseEnddt;
                    delete newEntry.databaseStartdt;
                    delete newEntry.databaseEnddt;

                    return new ClientResource(newEntry);
                });
                this.setClientDatabase(databases);
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

    async add(payload, clientId) {
        try {
            this.setLoading(true);
            const { data } = await http.post(`admin/client/${clientId}/database`, payload);

            events.emit("new.client");

            if (data.data) {
                const response = {
                    ...data.data,
                    clientDatabaseStartDate: data.data?.clientDatabaseStartdt,
                    clientDatabaseEndDate: data.data?.clientDatabaseEnddt,
                    databaseStartDate: data.data?.databaseStartdt,
                    databaseEndDate: data.data?.databaseEnddt,
                };
                delete response.clientDatabaseStartdt;
                delete response.clientDatabaseEnddt;
                delete response.databaseEnddt;
                delete response.databaseStartdt;

                const databases = data.data
                    ? [...this.clientDatabases, new ClientResource(response)]
                    : this.clientDatabases;
                this.setClientDatabase(databases);
            }

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

    async update(payload, clientId, databaseId) {
        try {
            this.setLoading(true);
            const { data } = await http
                .put(`admin/client/${clientId}/database/${databaseId}`, payload)
                .stagger(STAGGER_ID);

            const target = this.clientDatabases.findIndex(db => db.databaseId === databaseId);

            const response = {
                ...data.data,
                clientDatabaseStartDate: data.data.clientDatabaseStartdt,
                clientDatabaseEndDate: data.data.clientDatabaseEnddt,
                databaseStartDate: data.data?.databaseStartdt,
                databaseEndDate: data.data?.databaseEnddt,
            };

            delete response.clientDatabaseStartdt;
            delete response.clientDatabaseEnddt;
            delete response.databaseEnddt;
            delete response.databaseStartdt;

            const clientDatabases = [...this.clientDatabases];
            clientDatabases[target] = new ClientResource(response);

            this.setClientDatabase(clientDatabases);

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

    async delete(clientId, databaseId) {
        try {
            this.setLoading(true);
            await http.delete(`admin/client/${clientId}/database/${databaseId}`);

            const eligibleDatabases = this.clientDatabases.filter(
                resource => resource?.databaseId !== databaseId
            );

            this.setClientDatabase(eligibleDatabases);

            events.emit("new.client");

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

export default new Resources();
