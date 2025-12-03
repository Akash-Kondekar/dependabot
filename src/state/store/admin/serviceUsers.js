import { action, makeObservable } from "mobx";
import { v4 as uuid } from "uuid";
import BaseStore from "../base";
import { formatDate } from "../../../utils";
import { CONTACT_ADMIN_MESSAGE, CURRENT_DATE } from "../../../constants";
import http from "../../../lib/http";
import ServiceUser from "../../model/admin/serviceUser";
import { ShowError } from "../../../components/Common";
import { DATE_TIME_FORMAT } from "../../../config";

const STAGGER_ID = uuid();

export class Credential {
    constructor(id, userId, password) {
        (this.id = id), (this.userId = userId), (this.password = password);
    }
}

const INITIAL_STATE = {
    id: 0,
    userId: "",
    status: 0,
    expiry: formatDate(CURRENT_DATE, DATE_TIME_FORMAT),
    deleted: false,
};
export class ServiceUsers extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            load: action,
            add: action,
            update: action,
            remove: action,
            restore: action,
            setLoading: action,
            setServiceUsers: action,
            appendServiceUser: action,
            set: action,
            reset: action,
            setCredentials: action,
            resetCredentials: action,
        });
    }

    observable() {
        return {
            loading: false,
            list: [],
            serviceUser: INITIAL_STATE,
            credentials: new Map(),
        };
    }

    set(serviceUser) {
        this.serviceUser = serviceUser;
    }

    reset() {
        this.serviceUser = INITIAL_STATE;
    }

    setServiceUsers(list) {
        this.list = list;
    }
    appendServiceUser(index, serviceUser) {
        this.list[index] = serviceUser;
    }

    setLoading(status) {
        this.loading = status;
    }

    setCredentials(key, credential) {
        if (key > 0) {
            this.credentials.set(key, credential);
        }
    }

    resetCredentials() {
        this.credentials.clear();
    }

    async load() {
        try {
            this.setLoading(true);
            const { data } = await http.get("admin/service-users").stagger(STAGGER_ID);

            if (data?.data) {
                const serviceUsers = data.data.map(entry => {
                    return new ServiceUser(entry);
                });
                this.setServiceUsers(serviceUsers);
            }
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error?.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async add(payload) {
        try {
            this.setLoading(true);
            const { data } = await http.post("admin/service-users", payload).stagger(STAGGER_ID);
            if (data?.data) {
                this.setCredentials(
                    data.data?.id,
                    new Credential(data.data?.id, data.data?.userId, data.data?.password)
                );
                const serviceUser = new ServiceUser(data.data);
                const serviceUsers = [...this.list, serviceUser];
                this.setServiceUsers(serviceUsers);
                return true;
            }
            return false;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async update(payload) {
        if (!payload?.id) {
            return ShowError("Service user id is missing in the payload");
        }

        try {
            this.setLoading(true);
            const url = `admin/service-users/${payload?.id}`;
            const { data } = await http.put(url, payload).stagger(STAGGER_ID);
            if (data?.data) {
                const target = this.list?.findIndex(s => s?.id === this.serviceUser?.id);
                this.appendServiceUser(target, new ServiceUser(data.data));
            }
            return true;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error?.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async remove(id) {
        try {
            this.setLoading(true);
            const { data } = await http
                .put("admin/service-users/" + id + "/deactivate")
                .stagger(STAGGER_ID);
            if (data?.data) {
                const target = this.list?.findIndex(s => s?.id === id);
                this.appendServiceUser(target, new ServiceUser(data.data));
                return true;
            }
            return false;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error?.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async restore(id) {
        try {
            this.setLoading(true);
            const { data } = await http
                .put("admin/service-users/" + id + "/restore")
                .stagger(STAGGER_ID);
            if (data?.data) {
                const target = this.list?.findIndex(s => s?.id === id);
                this.appendServiceUser(target, new ServiceUser(data.data));
                return true;
            }
            return false;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error?.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async resetPassword(id) {
        try {
            this.setLoading(true);
            const { data } = await http
                .put("admin/service-users/" + id + "/password-reset")
                .stagger(STAGGER_ID);
            if (data?.data) {
                const target = this.list?.findIndex(s => s?.id === id);
                const serviceUser = this.list[target];
                this.setCredentials(id, new Credential(id, serviceUser?.userId, data.data));
                this.appendServiceUser(target, serviceUser);
                return true;
            }
            return false;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error?.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }
}

export default new ServiceUsers();
