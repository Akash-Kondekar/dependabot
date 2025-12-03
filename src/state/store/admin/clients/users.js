import { action, makeObservable, computed } from "mobx";
import { v4 as uuid } from "uuid";
import BaseStore from "../../base";
import http from "../../../../lib/http";
import User from "../../../model/user";
import clientStore from "./details";
import { ShowError, ShowSuccess } from "../../../../components/Common";

const STAGGER_ID = uuid();

export class Users extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            getAllActiveUsers: action,
            add: action,
            delete: action,
            getClientUsers: action,
            setClientUsers: action,
            setLoading: action,
            setUsers: action,
            reset: action,
            busy: computed,
            clientId: computed,
        });
    }

    observable() {
        return {
            loading: false,
            list: [],
            clientUsers: [],
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    setUsers(users) {
        this.list = users;
    }

    setClientUsers(users) {
        this.clientUsers = users;
    }

    reset() {
        this.clientUsers = [];
    }

    get busy() {
        return this.loading;
    }

    get clientId() {
        return clientStore.client?.id;
    }

    async getAllActiveUsers() {
        if (!this.clientId) {
            return;
        }

        try {
            this.setLoading(true);
            const { data } = await http
                .get(`admin/client/${this.clientId}/eligible-users`)
                .stagger(STAGGER_ID);

            const users = data.data?.map(entry => {
                return new User(entry);
            });
            this.setUsers(users);

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

    async getClientUsers(clientId) {
        try {
            this.setLoading(true);
            const { data } = await http.get(`admin/client/${clientId}/users`);

            const response = data.data.users.map(entry => {
                return new User(entry);
            });

            this.setClientUsers(response);
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

    async add(payload, clientId) {
        try {
            this.setLoading(true);
            const { data } = await http.post(`admin/client/${clientId}/user`, payload);

            const users = data.data ? [...this.clientUsers, new User(data.data)] : this.clientUsers;
            this.setClientUsers(users);
            ShowSuccess("Saved Successfully");

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

    async delete(clientId, userId, role) {
        try {
            this.setLoading(true);
            await http.delete(`admin/client/${clientId}/user/${userId}/role/${role}`);

            this.setClientUsers(this.clientUsers.filter(user => user.userId !== userId));
            ShowSuccess("Deleted Successfully");
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

export default new Users();
