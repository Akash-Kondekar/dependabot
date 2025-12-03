import { makeObservable, action } from "mobx";
import BaseStore from "../base";
import Job from "../../model/study/job";

import { v4 as uuid } from "uuid";
import http from "../../../lib/http";
import { ADDONS, CONTACT_ADMIN_MESSAGE, ALL } from "../../../constants";
import { ShowError } from "../../../components/Common";
const STAGGER_ID = uuid();

export class AdminJobsAndAddOns extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            load: action,
            setLoading: action,
            setList: action,
        });
    }

    observable() {
        return {
            list: [],
            loading: false,
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    setList(list) {
        this.list = list;
    }

    async load(jobType) {
        try {
            let url = `/admin/all-jobs`;

            if (jobType === ADDONS) {
                url = `/admin/all-addons`;
            }

            this.setLoading(true);
            let { data } = await http.get(url).stagger(STAGGER_ID);
            const result = data.data?.jobDetails ?? [];

            const jobs = result.map(data => new Job(data));
            this.setList(jobs);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async update(projectID, jobID, newStatus, jobType) {
        try {
            this.setLoading(true);

            let url = `admin/projects/${projectID}/${jobType}/${jobID}/${newStatus}/${ALL.toLowerCase()}`;

            const { data } = await http.put(url).stagger(STAGGER_ID);

            if (data.data) {
                const result = data.data;

                const jobs = [...this.list];

                const target = jobs?.findIndex(job => job.jobID === jobID);

                jobs[target] = new Job(result);

                this.setList(jobs);
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
}

export default new AdminJobsAndAddOns();
