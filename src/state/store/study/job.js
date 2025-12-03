import { action, makeObservable } from "mobx";
import BaseStore from "../base";
import Job from "../../model/study/job";

import { v4 as uuid } from "uuid";
import http from "../../../lib/http";
import events from "../../../lib/events";
import { ShowError } from "../../../components/Common";

const STAGGER_ID = uuid();

export class JobStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            load: action,
            save: action,
            setLoading: action,
            setData: action,
        });
        events.on("reset.job", this.reset.bind(this));
    }

    observable() {
        return {
            data: {},
            loading: false,
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    setData(data) {
        this.data = data;
    }

    async load(projectID = "4", jobID = "3041", _mode = "", addonMode = undefined) {
        // Fetch the data here by making the API Call.
        // Assign the data to this.list by returning a new instance of the Model

        if (projectID === this.data?.projectID && jobID === this.data?.jobID) {
            return;
        }

        try {
            this.setLoading(true);

            let url = `/projects/${projectID}/jobs/${jobID}`;
            if (addonMode === "load") {
                url = `/projects/${projectID}/addons/${jobID}`;
            }

            let response = await http.get(url).stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data.jobDetails;

            this.setData(new Job(result));
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

    reset() {
        this.data.jobID = undefined;
    }

    async save(request) {
        // Fetch the data here by making the API Call.
        if (!request) {
            return;
        }

        try {
            this.setLoading(true);

            const result = await http.post("/jobs", request).stagger(STAGGER_ID);

            const { data } = result;

            return data;
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

export default new JobStore();
