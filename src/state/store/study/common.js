import BaseStore from "../../model/base";
import { action, makeObservable } from "mobx";
import Job from "../../model/study/job";
import jobStore from "../../store/study/job";
import period from "../../store/study/period";
import events from "../../../lib/events";

export class CommonJobsStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            loadSummary: action,
        });
        events.on("reset.all.job.stores", this.resetAllStores.bind(this));
    }

    observable() {
        return {
            loading: false,
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    resetAllStores() {
        events.emit("reset.period");
        events.emit("reset.expose");
        events.emit("reset.unexposed");
        events.emit("reset.baseline");
        events.emit("reset.records");
        events.emit("reset.outcome");
        events.emit("reset.job");
        events.emit("reset.database");
    }

    loadSummary(data) {
        if (!data) {
            return;
        }

        jobStore.setData(new Job(data));
        period.load(jobStore.data, "");
    }
}

export default new CommonJobsStore();
