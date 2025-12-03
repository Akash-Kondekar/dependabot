import { action, makeObservable } from "mobx";
import { v4 as uuid } from "uuid";
import BaseStore from "../base";
import http from "../../../lib/http";
import AnalyticsJobs from "../../model/admin/analyticsJobs";
import { CONTACT_ADMIN_MESSAGE } from "../../../constants";
import { ShowError } from "../../../components/Common";
const STAGGER_ID = uuid();

export class Analytics extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            load: action,
            setLoading: action,
            setAnalyticsJobs: action,
        });
    }

    observable() {
        return {
            analyticsJobs: [],
            loading: false,
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    setAnalyticsJobs(jobs) {
        this.analyticsJobs = jobs;
    }

    reset() {
        this.analyticsJobs = [];
    }

    async load() {
        try {
            this.setLoading(true);
            let { data } = await http.get("admin/analytics").stagger(STAGGER_ID);
            const result = data.data?.jobDetails ?? [];
            const jobs = result.map(entry => {
                return new AnalyticsJobs(entry);
            });
            this.setAnalyticsJobs(jobs);
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

export default new Analytics();
