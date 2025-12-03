import { action, makeObservable } from "mobx";
import BaseStore from "../../base";
import DataExtractionReport from "../../../model/study/analytics/dataExtractionReport";

import { v4 as uuid } from "uuid";
import http from "../../../../lib/http";
import { ShowError } from "../../../../components/Common";
import { CONTACT_ADMIN_MESSAGE } from "../../../../constants";
import commonAnalyticsStore from "./common";

const STAGGER_ID = uuid();

export class DataExtractionReportStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            load: action,
            setLoading: action,
            setData: action,
        });
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

    async load(preLoad) {
        try {
            this.setLoading(true);
            if (preLoad) {
                this.setData(new DataExtractionReport(preLoad));
            } else {
                const projectID = commonAnalyticsStore.projectID;
                const jobID = commonAnalyticsStore.jobID;
                if (projectID === "" || jobID === "") {
                    return;
                }
                const url = `/projects/${projectID}/jobs/${jobID}/analytics/dataextractionreport`;

                const response = await http.get(url).stagger(STAGGER_ID);

                const { data } = response;

                const dataExtractionReport = data.data;

                if (dataExtractionReport) {
                    this.setData(new DataExtractionReport(dataExtractionReport));
                } else {
                    //For study other than inc_prev when response is null
                    this.setData({});
                }
            }
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            this.setData({});

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }
}

export default new DataExtractionReportStore();
