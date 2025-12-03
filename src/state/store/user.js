import { action, makeObservable, computed } from "mobx";
import BaseStore from "./base";
import http from "../../lib/http";
import session from "./session";
import UserClientDetails from "../model/userClientDetails";
import { formatDate } from "../../utils";
import { CURRENT_DATE, CONTACT_ADMIN_MESSAGE } from "../../constants";
import clients from "./admin/clients/list";
import events from "../../lib/events";
import UserModel from "../model/user";
import { ShowError } from "../../components/Common";

export const CLIENT_STATUS_MESSAGE = {
    ACTIVE: "Client is active",
    EXPIRED: "You are mapped to an expired client. Please connect with the Administrator.",
    INACTIVE: "You are not mapped to an active client. Please connect with the Administrator.",
    NODATA: "No active client available.",
    PROJECT_CLIENT_INACTIVE: "Client for which this project was created is not active.",
};

const FORMATTED_CURRENT_DATE = formatDate(CURRENT_DATE, "yyyy-MM-dd");

export class User extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            busy: computed,
            setLoading: action,
            getClientDetails: action,
            setClientDetails: action,
            isActiveClient: computed,
            clientStatusMessage: computed,
            //project.data.dbName provides value as database Id which is then compared against a list of active databases to get its corresponding name using database action.
            //While reloading the study if the db in inactive, database action returns undefined which is causing DXT-230 bug. As a fix we are calling getInactiveDatabaseNameForStudy
            //to get the name of inactive database to display appropriate message under study.
            getInactiveDatabaseNameForStudy: action,
            setInactiveDb: action,
            resetInactiveDb: action,
            getClientDetailByProjectId: action,
            setClientDetailsFetched: action,
            resetClientDetailsFetched: action,
            setClientUsers: action,
            getEligibleReviewers: action,
            setEligibleReviewers: action,
            setDatabaseDetails: action,
        });
        events.on("auth.logout", this.resetClientDetailsFetched.bind(this));
    }

    observable() {
        return {
            loading: false,
            clientDetails: {},
            inactiveDb: "", //stores db name while re-loading a study whose database is not active
            clientDetailsFetched: false,
            clientUsers: [],
            eligibleReviewers: [],
            databaseDetails: [],
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    setClientDetails(client) {
        this.clientDetails = client;
    }

    get busy() {
        return this.loading;
    }

    setInactiveDb(dbName) {
        if (dbName) {
            this.inactiveDb = dbName;
        }
    }

    resetInactiveDb() {
        this.inactiveDb = "";
    }

    setClientDetailsFetched(status) {
        this.clientDetailsFetched = status;
    }

    resetClientDetailsFetched() {
        this.clientDetailsFetched = false;
    }

    setClientUsers(data) {
        this.clientUsers = data;
    }

    setEligibleReviewers(data) {
        this.eligibleReviewers = data.filter(user => user.userId !== session.loggedInUser);
    }

    get isActiveClient() {
        return (
            this.clientDetails?.clientEndDate > FORMATTED_CURRENT_DATE &&
            this.clientDetails?.clientDeleted === false &&
            this.clientDetails?.clientStartDate <= FORMATTED_CURRENT_DATE
        );
    }

    get clientHasName() {
        return this.clientDetails?.clientName;
    }

    get clientStatusMessage() {
        if (session.isAdmin) {
            const hasActiveClient =
                clients.allActiveClients && clients.allActiveClients?.length > 0;

            if (!hasActiveClient) {
                return CLIENT_STATUS_MESSAGE.NODATA;
            }
        }

        if (session.isAdmin && !this.isActiveClient) {
            return CLIENT_STATUS_MESSAGE.PROJECT_CLIENT_INACTIVE;
        }

        if (
            this.clientDetails === undefined ||
            this.clientDetails?.clientStartDate >= FORMATTED_CURRENT_DATE
        ) {
            return CLIENT_STATUS_MESSAGE.INACTIVE;
        }

        if (this.clientDetails?.clientEndDate < FORMATTED_CURRENT_DATE) {
            return CLIENT_STATUS_MESSAGE.EXPIRED;
        }

        if (this.isActiveClient) {
            return CLIENT_STATUS_MESSAGE.ACTIVE;
        }

        return "Something went wrong";
    }

    setDatabaseDetails(data) {
        this.databaseDetails = data;
    }

    async getClientDetails() {
        const loggedInUser = session.loggedInUser;

        //If its admin, skip this and call getClientDetailByProjectId

        if (!loggedInUser || session.isAdmin) {
            return;
        }

        try {
            this.setLoading(true);

            const { data } = await http.get(`user/${loggedInUser}/clientDetails`);

            this.setClientDetailsFetched(true);

            if (data?.data !== undefined) {
                const client = {
                    ...data.data,
                    clientStartDate: data.data.clientStartdt,
                    clientEndDate: data.data.clientEnddt,
                };
                delete client.clientStartdt;
                delete client.clientEnddt;
                this.setClientDetails(new UserClientDetails(client));
            }
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            this.setClientDetails(undefined);
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async getInactiveDatabaseNameForStudy(id) {
        try {
            this.setLoading(true);

            const { data } = await http.get(`user/database/${id}`);

            if (data.data) {
                this.setInactiveDb(data.data);
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

    async getClientDetailByProjectId(projectID) {
        const loggedInUser = session.loggedInUser;

        if (!loggedInUser) {
            return;
        }

        try {
            this.setLoading(true);

            const { data } = await http.get(`admin/project/${projectID}/clientDetails`);

            if (data?.data !== undefined) {
                const client = {
                    ...data.data,
                    clientStartDate: data.data.clientStartdt,
                    clientEndDate: data.data.clientEnddt,
                };
                delete client.clientStartdt;
                delete client.clientEnddt;
                this.setClientDetails(new UserClientDetails(client));
            }
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            this.setClientDetails(undefined);
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async getEligibleReviewers() {
        try {
            this.setLoading(true);
            const { data } = await http.get(`user/eligibleReviewers`);
            if (data.data) {
                const response = data.data?.map(entry => {
                    return new UserModel(entry);
                });

                this.setEligibleReviewers(response);
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

    async getDatabaseDetails() {
        try {
            this.setLoading(true);

            const { data } = await http.get("user/databaseDetails");
            this.setDatabaseDetails(data?.data);
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

export default new User();
