import { action, makeObservable } from "mobx";
import BaseStore from "../base";
import Job from "../../model/study/job";

import { v4 as uuid } from "uuid";
import http from "../../../lib/http";
import { CONTACT_ADMIN_MESSAGE, FULLDB } from "../../../constants";
import { ShowError } from "../../../components/Common";

const STAGGER_ID = uuid();

export class AdminJobsStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            load: action,
            update: action,
            setLoading: action,
            setList: action,
            updatePriority: action,
            cancelAddon: action,
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

    async load(type) {
        try {
            this.setLoading(true);

            let url = `/admin/${type}/queue`;
            let { data } = await http.get(url).stagger(STAGGER_ID);

            const result = data.data;

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

    async update(projectID, jobID, newStatus, type) {
        try {
            this.setLoading(true);

            let url = `admin/projects/${projectID}/${type.toLowerCase()}/${jobID}/${newStatus}/${FULLDB}`;
            let { data } = await http.put(url).stagger(STAGGER_ID);

            const result = data.data;
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

    async updatePriority(projectID, jobID, newPriority, type) {
        if (!projectID || !jobID || newPriority === undefined || !type) {
            return;
        }

        try {
            this.setLoading(true);

            const url =
                `admin/projects/${projectID}/${type}/${jobID}/priority/${newPriority}`.toLowerCase();
            const { data } = await http.put(url).stagger(STAGGER_ID);

            if (data.data) {
                const jobs = [...this.list];
                const target = jobs.findIndex(job => job.jobID === jobID);

                delete data.data?.addons;

                jobs[target] = { addons: jobs[target]?.addons, ...new Job(data.data) };
                this.setList(jobs);

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

    /*
     This method was created to cancel an ADDON. We are using update method in other
	 places but update method returns both addon and jobs which is not required for admin >> misc >> queue
	 We have added a radio option to show job and add on separately and hence instead of tampering
	 with exiting method, a new method was created.
     */
    async cancelAddon(projectID, addonID) {
        if (!projectID || !addonID) {
            return;
        }

        try {
            this.setLoading(true);

            const url = `admin/projects/${projectID}/addons/${addonID}/cancel`;
            const { data } = await http.put(url).stagger(STAGGER_ID);

            if (data.data) {
                const jobs = this.list.filter(addon => {
                    return addon?.jobID !== addonID;
                });

                this.setList(jobs);

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
}

export default new AdminJobsStore();
