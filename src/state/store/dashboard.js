import { makeObservable, action, computed } from "mobx";
import BaseStore from "./base";
import Dashboard from "./../model/dashboard";
import NewDashboard from "../model/newDashboard";

import { v4 as uuid } from "uuid";
import http from "../../lib/http";
import { CONTACT_ADMIN_MESSAGE, GetJobStatusDesc } from "../../constants";
import { ShowError } from "../../components/Common";

const STAGGER_ID = uuid();

export class DashboardStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            load: action,
            setLoading: action,
            setData: action,
            setAlertClosed: action,
            busy: computed,
            loadLatestStudiesAndCodes: action,
            updateData: action,
            setDbAlertClosed: action,
            setClientAlertClosed: action,
            hasStudiesAndCodes: computed,
        });
    }

    observable() {
        return {
            data: {},
            loading: false,
            expiredAlertClosed: false,
            expiredClientAlertClosed: false,
            expiredDbAlertClosed: false,
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    setData(data) {
        this.data = data;
    }

    setAlertClosed() {
        this.expiredAlertClosed = true;
    }

    setClientAlertClosed() {
        this.expiredClientAlertClosed = true;
    }

    setDbAlertClosed() {
        this.expiredDbAlertClosed = true;
    }

    updateData(studyId, status) {
        const newData = { ...this.data };
        const target = newData.latestStudies.findIndex(study => study.jobID === studyId);
        newData.latestStudies[target].status = status;
        newData.latestStudies[target].statusDescription = GetJobStatusDesc(status);
        this.setData(newData);
    }

    get hasStudiesAndCodes() {
        return (
            this.data?.latestStudies?.length > 0 ||
            this.data?.latestMedCodes?.length > 0 ||
            this.data?.latestDrugCodes?.length > 0
        );
    }

    get busy() {
        return this.loading;
    }

    async load() {
        try {
            this.setLoading(true);
            const { data } = await http.get("user/dashboard").stagger(STAGGER_ID);
            if (data?.data) {
                this.setData(new Dashboard(data.data));
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

    //API to get latest studies and code list for new UI

    async loadLatestStudiesAndCodes() {
        try {
            this.setLoading(true);
            const { data } = await http.get("user/dashboard/user-activity").stagger(STAGGER_ID);
            if (data?.data) {
                this.setData(new NewDashboard(data.data));
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
}

export default new DashboardStore();
