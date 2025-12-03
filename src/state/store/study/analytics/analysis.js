import { action, computed, makeObservable } from "mobx";
import BaseStore from "../../base";
import Analysis from "../../../model/study/analytics/analysis";

import http from "../../../../lib/http";
import { CONTACT_ADMIN_MESSAGE, INCIDENCE_PREVALENCE_OPTIONS } from "../../../../constants";
import commonAnalyticsStore from "./common";
import { ShowError } from "../../../../components/Common";

export const INITIAL_OPTION = "Incidence";

export class AnalysisStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            loadOverall: action,
            setLoading: action,
            setAnalysisList: action,
            setType: action,
            displayLabel: computed,
            displayName: computed,
            busy: computed,
            reset: action,
            loadSubgroups: action,
            setGroups: action,
            setSubgroups: action,
        });
    }

    observable() {
        return {
            analysisList: [],
            loading: false,
            type: INITIAL_OPTION,
            groups: [],
            subgroups: [],
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    get busy() {
        return this.loading;
    }

    setAnalysisList(data) {
        this.analysisList = data;
    }

    setType(value) {
        this.type = value;
    }

    reset() {
        this.analysisList = [];
        this.type = INITIAL_OPTION;
    }

    setGroups(data) {
        const groups = [
            ...new Set(
                data?.map(item => {
                    return item?.group;
                })
            ),
        ];

        this.groups = groups;

        if (
            commonAnalyticsStore.currentCondition.groupSelected?.length === 0 &&
            groups?.length > 0
        ) {
            commonAnalyticsStore.setCurrentCondition({
                ...commonAnalyticsStore.currentCondition,
                groupSelected: [groups[0]],
            });
        }
    }

    setSubgroups(data) {
        const subgroups = [
            ...new Set(
                data?.map(item => {
                    return item?.subgroup;
                })
            ),
        ];

        this.subgroups = subgroups;
    }

    get displayLabel() {
        return INCIDENCE_PREVALENCE_OPTIONS[this.type?.toUpperCase()].LABEL;
    }

    get displayName() {
        return INCIDENCE_PREVALENCE_OPTIONS[this.type?.toUpperCase()].NAME;
    }

    async loadOverall() {
        if (commonAnalyticsStore.projectID === "" || commonAnalyticsStore.jobID === "") {
            return;
        }

        try {
            this.setLoading(true);

            const url = `/projects/${commonAnalyticsStore.projectID}/jobs/${commonAnalyticsStore.jobID}/analytics/Overall/${this.type}/analysis`;

            const response = await http.get(url);

            const { data } = response;

            const analysisResult = data.data;

            //For study other than inc_prev when response is null
            if (!analysisResult) {
                return this.setAnalysisList([]);
            }

            const analysis = analysisResult?.map(entry => {
                return new Analysis(entry);
            });

            this.setAnalysisList(analysis);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            this.setAnalysisList([]);

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async loadSubgroups(variables = []) {
        if (
            commonAnalyticsStore.projectID === "" ||
            commonAnalyticsStore.jobID === "" ||
            variables.length === 0
        ) {
            return;
        }

        try {
            this.setLoading(true);

            const url = `/projects/${commonAnalyticsStore.projectID}/jobs/${commonAnalyticsStore.jobID}/analytics/Subgroup/${this.type}/analysis`;

            const payload = variables;

            const response = await http.post(url, payload);

            const { data } = response;

            const analysisResult = data.data;

            //For study other than inc_prev when response is null
            if (!analysisResult) {
                return this.setAnalysisList([]);
            }

            const analysis = analysisResult?.map(entry => {
                return new Analysis(entry);
            });

            this.setAnalysisList(analysis);

            this.setGroups(analysis);
            this.setSubgroups(analysis);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            this.setAnalysisList([]);
            this.setGroups([]);
            this.setSubgroups([]);

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }
}

export default new AnalysisStore();
