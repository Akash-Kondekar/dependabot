import { makeObservable, action } from "mobx";
import BaseStore from "../base";
import JobStatus from "../../model/study/job-status";
import ExtractionTelemetry from "../../model/study/extractionTelemetry";

import { v4 as uuid } from "uuid";
import http from "../../../lib/http";
import { CONTACT_ADMIN_MESSAGE } from "../../../constants";
import session from "../session";
import { ShowError } from "../../../components/Common";
const STAGGER_ID = uuid();

export class JobStatusStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            load: action,
            checkStatus: action,
            setStatus: action,
            save: action,
            setLoading: action,
            setData: action,
            setExtractionServiceStatus: action,
            setJobQueueStatus: action,
            setExtractionTelemetryList: action,
        });
    }

    observable() {
        return {
            data: {},
            loading: false,
            status: null,
            isExtractionServiceOn: false,
            serviceUsersStatus: [],
            jobQueueStatus: {
                value: 0,
                color: "info",
                lastUpdated: undefined,
            },
            extractionTelemetry: undefined,
            extractionTelemetryList: [],
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    setData(data) {
        this.data = data;
    }

    setStatus(status) {
        this.status = status;
    }
    setExtractionServiceStatus(status) {
        if (typeof status === "boolean") {
            this.isExtractionServiceOn = status;
        } else {
            this.serviceUsersStatus = status;
        }
    }

    setJobQueueStatus(extractionTelemetry) {
        this.extractionTelemetry = extractionTelemetry;
        const totalJobs =
            extractionTelemetry?.fullDbs +
            extractionTelemetry?.pilotRuns +
            extractionTelemetry?.addons;
        const point = extractionTelemetry?.waitingTimePoint;
        if (point < 2) {
            this.jobQueueStatus = {
                value: 10,
                color: "success",
                lastUpdated: extractionTelemetry?.timestamp,
                totalJobs: totalJobs,
            };
        } else if (point >= 2 && point < 50) {
            this.jobQueueStatus = {
                value: 35,
                color: "warning",
                lastUpdated: extractionTelemetry?.timestamp,
                totalJobs: totalJobs,
            };
        } else if (point >= 50) {
            this.jobQueueStatus = {
                value: 65,
                color: "error",
                lastUpdated: extractionTelemetry?.timestamp,
                totalJobs: totalJobs,
            };
        } else {
            this.jobQueueStatus = {
                value: 2,
                color: "success",
                lastUpdated: undefined,
                totalJobs: 0,
            };
        }
    }

    setExtractionTelemetryList(data) {
        this.extractionTelemetryList = data;
    }

    async load() {
        try {
            this.setLoading(true);

            let response = await http.get("/admin/job-status").stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data;

            this.setData(new JobStatus(result));
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async checkStatus() {
        try {
            this.setLoading(true);

            let response = await http.get("/users/job-status").stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data?.allowjobsubmission;

            this.setStatus(result);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async save(request) {
        if (!request) {
            return;
        }

        try {
            this.setLoading(true);

            const response = await http.put("/admin/job-status", request).stagger(STAGGER_ID);
            const { data } = response;
            const result = data.data;

            this.setStatus(result?.allowjobsubmission);
            this.setData(new JobStatus(result));
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async getJobQueueStatus() {
        try {
            this.setLoading(true);
            const response = await http.get("/extraction-status").stagger(STAGGER_ID);
            const result = response?.data?.data;
            if (result && session.isAdmin) {
                const extractionTelemetryList = result.map(entry => {
                    return new ExtractionTelemetry(entry);
                });
                this.setExtractionTelemetryList(extractionTelemetryList);
            } else {
                this.setJobQueueStatus(new ExtractionTelemetry(result));
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

    async getExtractionServiceStatus() {
        try {
            this.setLoading(true);
            const response = await http.get("/engine-status").stagger(STAGGER_ID);
            const result = response?.data?.data;
            this.setExtractionServiceStatus(result);
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

export default new JobStatusStore();
