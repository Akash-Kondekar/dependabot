import { action, makeObservable, computed } from "mobx";
import { v4 as uuid } from "uuid";
import BaseStore from "../../base";
import http from "../../../../lib/http";
import Clients from "../../../model/admin/clients/list";
import events from "../../../../lib/events";
import { formatDate } from "../../../../utils";
import { CONTACT_ADMIN_MESSAGE } from "../../../../constants";
import { ShowError } from "../../../../components/Common";

const STAGGER_ID = uuid();
const PAGE_SIZE = 10;

export class ClientList extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            load: action,
            setLoading: action,
            setList: action,
            setPage: action,
            setTerm: action,
            restore: action,
            remove: action,
            invokeClientsListAPI: action,
            busy: computed,
            loadAllClients: action,
            allActiveClients: computed,
            setAllClientDetailsFetched: action,
            resetAllClientDetailsFetched: action,
        });
        events.on("new.client", this.load.bind(this));
        events.on("auth.logout", this.resetAllClientDetailsFetched.bind(this));
    }

    observable() {
        return {
            loading: false,
            list: [],
            term: "",
            loaded: true,
            page: {
                pageNo: 1,
                pageSize: 1,
                totalElements: 1,
                totalPages: 2,
                last: true,
            },
            allClientDetailsFetched: false,
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    setList(list) {
        this.list = list;
    }

    setPage(type, value) {
        this.page = {
            ...this.page,
            [type]: value,
        };
    }

    setTerm(term) {
        this.term = term;
    }

    invokeClientsListAPI(boolean) {
        this.loaded = boolean;
    }

    setAllClientDetailsFetched(status) {
        this.allClientDetailsFetched = status;
    }

    resetAllClientDetailsFetched() {
        this.allClientDetailsFetched = false;
    }

    get busy() {
        return this.loading;
    }

    get allActiveClients() {
        const dateNow = formatDate(new Date(), "yyyy-MM-dd");

        return this.list?.filter(
            client =>
                client.endDate >= dateNow && client.deleted === false && client.startDate <= dateNow
        );
    }

    async load() {
        try {
            this.setLoading(true);
            const currentPage = this.page.pageNo;

            let url = `admin/clients?rows=${PAGE_SIZE}&page=${currentPage - 1}&sort=name&dir=asc`;
            if (this.term.trim() !== "") {
                url = `${url}&search=${this.term.trim()}`;
            }

            const { data } = await http.get(url).stagger(STAGGER_ID);

            const clients = data.data.clientsDetails.map(entry => {
                const newEntry = {
                    ...entry,
                    startDate: entry.startdt,
                    endDate: entry.enddt,
                };
                delete newEntry.startdt;
                delete newEntry.enddt;
                return new Clients(newEntry);
            });

            this.setList(clients);

            const pageCount = data.data?.stats?.totalElements || 1;
            this.setPage("totalElements", pageCount);
            this.setPage("pageSize", Math.ceil(pageCount / PAGE_SIZE));
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async remove(clientId) {
        try {
            this.setLoading(true);

            const { data } = await http.delete("admin/client/" + clientId).stagger(STAGGER_ID);

            const target = this.list.findIndex(cl => cl.id === clientId);

            if (data.data) {
                const updatedData = {
                    ...data.data,
                    databases: this.list[target]?.databases,
                    startDate: data.data.startdt,
                    endDate: data.data.enddt,
                };
                this.list[target] = {
                    ...this.list[target],
                    ...new Clients(updatedData),
                };

                delete this.list[target].enddt;
                delete this.list[target].startdt;
            }

            return true;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async restore(clientId) {
        try {
            this.setLoading(true);

            const { data } = await http.put(`admin/client/${clientId}/restore`).stagger(STAGGER_ID);

            const target = this.list.findIndex(cl => cl.id === clientId);

            if (data.data) {
                const updatedData = {
                    ...data.data,
                    databases: this.list[target]?.databases,
                    startDate: data.data.startdt,
                    endDate: data.data.enddt,
                };
                this.list[target] = {
                    ...this.list[target],
                    ...new Clients(updatedData),
                };

                delete this.list[target].enddt;
                delete this.list[target].startdt;
            }

            return true;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
            return false;
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

            this.setAllClientDetailsFetched(true);

            const clients = data.data.clientsDetails.map(entry => {
                const newEntry = {
                    ...entry,
                    startDate: entry.startdt,
                    endDate: entry.enddt,
                };
                delete newEntry.startdt;
                delete newEntry.enddt;
                return new Clients(newEntry);
            });

            this.setList(clients);
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

export default new ClientList();
