import { action, makeObservable } from "mobx";
import BaseStore from "../base";
import Outcome from "../../model/study/outcome";
import { v4 as uuidv4 } from "uuid";
import events from "../../../lib/events";

import { OUTCOME_AHD, OUTCOME_DRUGS, OUTCOME_MEDS, UNEDITABLE_FILE } from "../../../constants";

export class OutcomeStore extends BaseStore {
    constructor() {
        super();
        this.dirty = false;
        this.counter = 0;
        makeObservable(this, {
            load: action,
            addReadCode: action,
            addDrugCode: action,
            addAHDCode: action,
            create: action,
            updateValue: action,
            set: action,
            reset: action,
            setData: action,
            setExposureType: action,
            setMatchWithProperty: action,
            unSelectItem: action,
            setValue: action,
            removeValue: action,
        });
        events.on("reset.outcome", this.reset.bind(this));
        events.on("outcome", this.load.bind(this));
        events.on("outcome.hasCodes", () => {
            return this.hasCodes;
        });
    }

    observable() {
        return {
            data: [],
        };
    }

    setData(data) {
        for (const key in data) {
            const element = data[key];
            this.data[key] = element;
        }
    }

    reset() {
        this.dirty = false;
        this.setData({
            studyID: undefined,
            clinicalCodeList: [],
            ahdBeanList: [],
        });
    }

    get hasCodes() {
        return this.data.clinicalCodeList?.length > 0 || this.data.ahdBeanList?.length > 0;
    }

    // setInclude(code, index, value) {
    //   this.data[code][index].isIncluded = value;
    // }

    setValue(item, code, index, value) {
        this.data[code][index][item] = value;
    }

    removeValue(code, index, value) {
        delete this.data[code][index][value]; // value to be removed
    }

    unSelectItem(code, index) {
        this.data[code].splice(index, 1);
        // this.data[code][index]["tableData"].checked = false;
    }

    setExposureType(code, index, value) {
        this.data[code][index].exposureType = value;
    }

    setMatchWithProperty(code, index, value) {
        // this.data[code][index].matchPropertyWith = value;
        this.data[code][index].matchWith = value;
    }

    set(key, value) {
        this.data[key] = value;
    }

    updateValue(e) {
        const { name, value } = e.target;
        this.data[name] = value;
    }

    async load(data, mode, addonMode = undefined) {
        // Fetch the data here by making the API Call.
        // Assign the data to this.list by returning a new instance of the Model

        data?.clinicalCodeList &&
            data.clinicalCodeList.forEach(element => {
                if (mode === "modify" && addonMode === "create") {
                    element.exposureType = UNEDITABLE_FILE;
                }
                element.uniqueKey = uuidv4();
            });

        data?.ahdBeanList &&
            data.ahdBeanList.forEach(element => {
                if (mode === "modify" && addonMode === "create") {
                    element.exposureType = UNEDITABLE_FILE;
                }
                element.uniqueKey = uuidv4();
            });

        if (data?.ahdBeanList?.length > 0) {
            this.counter = data.ahdBeanList.length;
        }

        if (this.data?.studyID !== data?.studyID) {
            this.dirty = false;
        }

        if (this.dirty === false) {
            // TODO: Assigning element.uniqueKey can be done here. Not sure about the need of this. Can be deleted later.
            this.data = new Outcome(data);
            this.dirty = true;
        }
    }

    async addReadCode(input) {
        // Fetch the data which is selected by the user.
        // Assign the data to this.list by returning a new instance of the Model
        const {
            filename,
            owner,
            ownerID,
            type,
            codes,
            id,
            // _id,
            // isSelected = false,
            exposureType = 1,
            eventCounts = false,
            consultCounts = false,
            excluIfOcBefIn = false,
            uniqueKey = uuidv4(),
            clinicalCodeList,

            incl = true,
            years = 0,
            months = 0,
            fileType = OUTCOME_MEDS,
            addSubDaysToIndex = 0,
            matchWith = "none",
            beforeDays = 0,
            afterDays = 0,
            typeOfRecord = 1,
            matchingReq = false,
            enableMatchingBtn = false,
            lastModifiedBy,
            lastModifiedOn,
            label,
        } = input;
        const newReadCode = {
            filename,
            owner,
            ownerID,
            type,
            codes,
            id,
            // _id,
            // isSelected,
            exposureType,
            eventCounts,
            consultCounts,
            excluIfOcBefIn,
            uniqueKey,
            clinicalCodeList,

            incl,
            years,
            months,
            fileType,
            addSubDaysToIndex,
            matchWith,
            beforeDays,
            afterDays,
            typeOfRecord,
            matchingReq,
            enableMatchingBtn,
            lastModifiedBy,
            lastModifiedOn,
            label,
        };
        this.data.clinicalCodeList.push(newReadCode);
    }

    async addDrugCode(input) {
        // Fetch the data here by making the API Call.
        // Assign the data to this.list by returning a new instance of the Model
        const {
            filename,
            owner,
            ownerID,
            codes,
            id,
            // _id,
            // isSelected = false,
            exposureType = 1,
            eventCounts = false,
            consultCounts = false,
            excluIfOcBefIn = false,
            uniqueKey = uuidv4(),
            incl = true,
            years = 0,
            months = 0,
            fileType = OUTCOME_DRUGS,
            addSubDaysToIndex = 0,
            matchWith = "none",
            beforeDays = 0,
            afterDays = 0,
            typeOfRecord = 1,
            matchingReq = false,
            enableMatchingBtn = false,
            lastModifiedBy,
            lastModifiedOn,
            label,
        } = input;
        const newCode = {
            filename,
            owner,
            ownerID,
            codes,
            id,
            // _id,
            // isSelected,
            exposureType,
            eventCounts,
            consultCounts,
            excluIfOcBefIn,
            uniqueKey,
            incl,
            years,
            months,
            fileType,
            addSubDaysToIndex,
            matchWith,
            beforeDays,
            afterDays,
            typeOfRecord,
            matchingReq,
            enableMatchingBtn,
            lastModifiedBy,
            lastModifiedOn,
            label,
        };
        this.data.clinicalCodeList.push(newCode);
    }

    async addAHDCode(input) {
        // Fetch the data here by making the API Call.
        // Assign the data to this.list by returning a new instance of the Model
        const {
            datafile,
            dispName,
            ahdCode,
            vdata1,
            vdata2,
            vdata3,
            vdata4,
            vdata5,
            vdata6,
            data1,
            data2,
            data3,
            data4,
            data5,
            data6,
            name,
            // description,
            codes,
            // _id,
            // isSelected = false,
            exposureType = 1,
            eventCounts = false,
            consultCounts = false,
            excluIfOcBefIn = false,
            uniqueKey = uuidv4(),
            //TODO: StudyObj query field removal changes
            // query = "",

            incl = true,
            // years = "0",
            // months = "",
            fileType = OUTCOME_AHD,
            addSubDaysToIndex = 0,
            matchWith = "none",
            beforeDays = 0,
            afterDays = 0,
            typeOfRecord = 1,
            matchingReq = false,
            enableMatchingBtn = false,
            label,
        } = input;

        const newCode = {
            datafile,
            dispName,
            ahdCode,
            vdata1,
            vdata2,
            vdata3,
            vdata4,
            vdata5,
            vdata6,
            data1,
            data2,
            data3,
            data4,
            data5,
            data6,
            name,
            // description,
            codes,
            // _id,
            // isSelected,
            // isIncluded,
            eventCounts,
            consultCounts,
            excluIfOcBefIn,
            uniqueKey,
            //TODO: StudyObj query field removal changes
            // query,

            incl,
            // years,
            exposureType,
            fileType,

            addSubDaysToIndex,
            matchWith,
            beforeDays,
            afterDays,
            typeOfRecord,
            matchingReq,
            enableMatchingBtn,
            label,
            userQuery: "",
        };
        this.counter++;
        newCode.label = newCode.label + "_" + this.counter;
        this.data.ahdBeanList.push(newCode);
    }

    async create() {
        if (this.dirty === false) {
            this.data = new Outcome();
            this.dirty = true;
        }
    }
}

export default new OutcomeStore();
