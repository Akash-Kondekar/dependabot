import { action, makeObservable, computed } from "mobx";
import { v4 as uuid } from "uuid";
import BaseStore from "../../base";
import http from "../../../../lib/http";
import ClientDetails from "../../../model/admin/clients/details";
import { CLIENT_STATUS_DESC, CURRENT_DATE } from "../../../../constants";
import { formatDate } from "../../../../utils";
import { CONTACT_ADMIN_MESSAGE } from "../../../../constants";
import ClientListStore from "./list";
import Clients from "../../../model/admin/clients/list";
import { ShowError } from "../../../../components/Common";

const STAGGER_ID = uuid();

export const INITIAL_STATE = {
    name: "",
    description: "",
    startDate: formatDate(CURRENT_DATE, "yyyy-MM-dd"),
    endDate: formatDate(CURRENT_DATE, "yyyy-MM-dd"),
    domain: "",
    subdomains: [""],
};

export class Client extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            add: action,
            setLoading: action,
            set: action,
            setClient: action,
            reset: action,
            busy: computed,
            loadClient: action,
            setCurrentClient: action,
            update: action,
            clientId: computed,
        });
    }

    observable() {
        return {
            loading: false,
            client: INITIAL_STATE,
            currentClient: {},
        };
    }

    set(type, value) {
        this.client = {
            ...this.client,
            [type]: value,
        };
    }

    setClient(params) {
        this.client = params;
    }

    reset() {
        this.client = INITIAL_STATE;
    }

    setLoading(status) {
        this.loading = status;
    }

    get busy() {
        return this.loading;
    }

    get clientId() {
        return this.client.id;
    }

    setCurrentClient(client) {
        this.currentClient = client;
    }

    async add(payload) {
        try {
            this.setLoading(true);
            const { data } = await http.post("admin/client", payload);

            if (data.data) {
                const response = {
                    ...data.data,
                    startDate: data.data?.startdt,
                    endDate: data.data?.enddt,
                    databases: [],
                };
                delete response.startdt;
                delete response.enddt;

                const updatedClientList = [...ClientListStore.list, new Clients(response)];
                ClientListStore.setList(updatedClientList);

                this.setClient(new ClientDetails(response));
                this.setCurrentClient(response);
                return true;
            }
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

    async update(payload) {
        try {
            this.setLoading(true);
            const { data } = await http
                .put(`admin/client/${this.client.id}`, payload)
                .stagger(STAGGER_ID);

            if (data.data) {
                const { list } = ClientListStore;
                const target = list.findIndex(cl => cl.id === this.client.id);

                const response = {
                    ...data.data,
                    startDate: data.data?.startdt,
                    endDate: data.data?.enddt,
                    databases: list[target]?.databases,
                };
                delete response.startdt;
                delete response.enddt;

                list[target] = { ...list[target], ...new Clients(response) };
                ClientListStore.setList(list);

                this.setClient(new ClientDetails(response));
                this.setCurrentClient(response);

                return true;
            }
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

    async loadClient(clientId) {
        try {
            this.setLoading(true);
            const { data } = await http.get(`admin/client/${clientId}`);

            if (data.data) {
                const response = {
                    ...data.data,
                    startDate: data.data.startdt,
                    endDate: data.data.enddt,
                };
                delete response.startdt;
                delete response.enddt;

                this.setCurrentClient(response);
                return true;
            }
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

    // This function takes in client status which is derive from clientStatus function (util.js)
    // Right now, we are only considering status to identify if the client is readonly or not.
    readOnlyClient(status) {
        return status === CLIENT_STATUS_DESC.DELETED || status === CLIENT_STATUS_DESC.EXPIRED;
    }
}

export default new Client();
