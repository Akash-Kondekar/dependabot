import { action, computed, makeObservable } from "mobx";
import BaseStore from "../../base";
import { v4 as uuid } from "uuid";

import http from "../../../../lib/http";
import { CONTACT_ADMIN_MESSAGE } from "../../../../constants";
import { ShowError } from "../../../../components/Common";

const STAGGER_ID = uuid();

export const INITIAL_PERSON_YEARS = 1.0;

export const INITIAL_CURRENT_CONDITION = { conditionsSelected: [], groupSelected: [] };

const PERSON_YEARS_DISPLAY_NAME = {
    1.0: "1000",
    100.0: "100,000",
};

export class CommonAnalyticsStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            load: action,
            setLoading: action,
            setJobID: action,
            setProjectID: action,
            setVariableList: action,
            setPersonYears: action,
            setDisplayGraph: action,
            personYearsDisplayLabel: computed,
            setCurrentCondition: action,
            reset: action,
        });
    }

    observable() {
        return {
            jobID: "",
            loading: false,
            projectID: "",
            variableList: [],
            personYears: INITIAL_PERSON_YEARS,
            displayGraph: true,
            currentCondition: {
                conditionsSelected: [],
                groupSelected: [],
            },
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    setJobID(jobID) {
        this.jobID = jobID;
    }

    setProjectID(projectID) {
        this.projectID = projectID;
    }

    setVariableList(list) {
        this.variableList = list;
    }

    setPersonYears(value) {
        this.personYears = value;
    }

    setDisplayGraph(checked) {
        this.displayGraph = checked;
    }

    setCurrentCondition(condition) {
        this.currentCondition = condition;
    }

    reset() {
        this.personYears = INITIAL_PERSON_YEARS;
        this.displayGraph = true;
        this.currentCondition = INITIAL_CURRENT_CONDITION;
    }

    get personYearsDisplayLabel() {
        return PERSON_YEARS_DISPLAY_NAME[this.personYears];
    }

    async load() {
        try {
            this.setLoading(true);

            const url = `/projects/${this.projectID}/jobs/${this.jobID}/analytics/analysis/variables`;

            const response = await http.get(url).stagger(STAGGER_ID);

            const { data } = response;

            //For study other than inc_prev when response is null
            if (!data.data) {
                return this.setVariableList([]);
            }

            this.setCurrentCondition({
                ...INITIAL_CURRENT_CONDITION,
                conditionsSelected: [...data.data.slice(0, 5)],
            });
            this.setVariableList(data.data);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            this.setVariableList([]);
            this.setCurrentCondition(INITIAL_CURRENT_CONDITION);

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }
}

export default new CommonAnalyticsStore();
