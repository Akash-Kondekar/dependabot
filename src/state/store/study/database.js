import { action, makeObservable, computed } from "mobx";
import BaseStore from "../../store/base";
import Database from "../../model/study/database";
import projectDetails from "../../store/projects/details";
import events from "../../../lib/events";
import { prepareData } from "../../../utils";

export class DatabaseStore extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            load: action,
            reset: action,
            setData: action,
            dbDetails: action,
            listOfEligibleDatabases: computed,
        });

        events.on("reset.database", this.reset.bind(this));
        events.on("database", this.load.bind(this));
    }

    observable() {
        return {
            data: {},
            dirty: false,
        };
    }

    setData(data) {
        this.data = data;
    }

    reset() {
        this.dirty = false;
        this.data = {};
    }

    get listOfEligibleDatabases() {
        const options = {
            value: "id",
            label: this.data?.version !== "" ? "dbNameWithVersion" : "name",
        };
        return prepareData(projectDetails.listOfUserDatabases, options);
    }

    dbDetails(id) {
        return projectDetails.listOfUserDatabases?.find(db => db.id === parseInt(id));
    }

    dbDetailsSummary() {
        return {
            name: this.data?.name,
            version: this.data?.version,
        };
    }

    async load(data) {
        if (this.data?.studyID !== data?.studyID) {
            this.dirty = false;
        }
        if (this.dirty === false) {
            this.setData(new Database(data));
            this.dirty = true;
        }
    }
}

export default new DatabaseStore();
