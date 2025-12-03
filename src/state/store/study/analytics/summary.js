import { action, makeObservable } from "mobx";
import BaseStore from "../../base";
import Summary from "../../../model/study/analytics/summary";

import { v4 as uuid } from "uuid";
import http from "../../../../lib/http";
import { CONTACT_ADMIN_MESSAGE } from "../../../../constants";
import commonAnalyticsStore from "./common";
import { ShowError } from "../../../../components/Common";

const STAGGER_ID = uuid();

const SUBGROUPVALUE = {
    SEXM: "SEX M",
    SEXF: "SEX F",
    SEXI: "SEX I",
};

export class SummaryStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            load: action,
            setLoading: action,
            setSummaryList: action,
            reset: action,
        });
    }

    observable() {
        return {
            summaryList: [],
            loading: false,
            jobID: "",
            projectID: "",
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    setSummaryList(data) {
        this.summaryList = data;
    }

    reset() {
        this.summaryList = [];
    }

    async load() {
        if (commonAnalyticsStore.projectID === "" || commonAnalyticsStore.jobID === "") {
            return;
        }

        try {
            this.setLoading(true);

            const url = `/projects/${commonAnalyticsStore.projectID}/jobs/${commonAnalyticsStore.jobID}/analytics/summary`;

            const response = await http.get(url).stagger(STAGGER_ID);

            const { data } = response;
            const summaryData = data.data;

            //For study other than inc_prev when response is null
            if (summaryData) {
                this.setSummaryList([]);
            }

            if (summaryData) {
                const summary = summaryData?.map(entry => {
                    entry.sexM = entry.subGroupValue[SUBGROUPVALUE.SEXM];
                    entry.sexF = entry.subGroupValue[SUBGROUPVALUE.SEXF];
                    entry.sexI = entry.subGroupValue[SUBGROUPVALUE.SEXI];
                    delete entry.subGroupValue;
                    return new Summary(entry);
                });

                this.setSummaryList(summary);
            }
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
                this.setSummaryList([]);
            }
        } finally {
            this.setLoading(false);
        }
    }
}

export default new SummaryStore();
