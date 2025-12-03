import { action, makeObservable } from "mobx";
import BaseStore from "../../store/base";
import { v4 as uuidv4 } from "uuid";
import Match from "../../model/study/match";
import events from "../../../lib/events";

import { CONTROL_AHD, CONTROL_DRUGS, CONTROL_MEDS } from "../../../constants";

export class MatchStore extends BaseStore {
    constructor() {
        super();
        this.dirty = false;
        makeObservable(this, {
            load: action,
            create: action,
            updateValue: action,
            set: action,
            addReadCode: action,
            addDrugCode: action,
            addAHDCode: action,

            // setInclude: action,
            setExposureType: action,

            setMatchWithProperty: action,
            unSelectItem: action,
            setValue: action,
        });
        events.on("match", this.load.bind(this));
    }

    // setInclude(code, index, value) {
    //   this.data[code][index].isIncluded = value;
    // }

    setValue(item, code, index, value) {
        this.data[code][index][item] = value;
    }

    unSelectItem(code, index) {
        this.data[code].splice(index, 1);
    }

    setExposureType(code, index, value) {
        this.data[code][index].exposureType = value;
    }

    setMatchWithProperty(code, index, value) {
        this.data[code][index].matchWith = value;
    }

    set(key, value) {
        this.data[key] = value;
    }

    updateValue(e) {
        const { name, value } = e.target;
        this.data[name] = value;
    }

    observable() {
        return {
            data: [],
        };
    }

    async load(data) {
        // Fetch the data here by making the API Call.
        // Assign the data to this.list by returning a new instance of the Model
        if (this.data?.studyID !== data.studyID) {
            this.dirty = false;
        }

        if (this.dirty === false) {
            this.data = new Match(data);
            this.dirty = true;
        }
    }

    async addReadCode(input) {
        // Fetch the data which is selected by the user.
        // Assign the data to this.list by returning a new instance of the Model
        const {
            name,
            owner,
            ownerID,
            type,
            codes,
            _id,
            // isSelected = false,
            // isIncluded = "1",
            exposureType = 1,
            uniqueKey = uuidv4(),
            clinicalCodeList,
            incl = true,
            years = "0",
            months = 0,
            eventCounts = false,
            consultCounts = false,
            fileType = CONTROL_MEDS,
            excluIfOcBefIn = false,
            addSubDaysToIndex = 0,
            matchWith = "none",
            beforeDays = 0,
            afterDays = 0,
            typeOfRecord = "1",
            matchingReq = false,
            enableMatchingBtn = false,
        } = input;
        const newReadCode = {
            name,
            owner,
            ownerID,
            type,
            codes,
            _id,
            // isSelected,
            // isIncluded,
            exposureType,

            uniqueKey,
            clinicalCodeList,

            incl,
            years,
            months,
            eventCounts,
            consultCounts,
            fileType,
            excluIfOcBefIn,
            addSubDaysToIndex,
            matchWith,
            beforeDays,
            afterDays,
            typeOfRecord,
            matchingReq,
            enableMatchingBtn,
        };
        this.data.reads.push(newReadCode);
    }

    async addDrugCode(input) {
        // Fetch the data here by making the API Call.
        // Assign the data to this.list by returning a new instance of the Model
        const {
            name,
            owner,
            ownerID,
            codes,
            _id,
            // isSelected = false,
            // isIncluded = "1",
            uniqueKey = uuidv4(),
            clinicalCodeList,
            incl = true,
            eventCounts = false,
            consultCounts = false,
            excluIfOcBefIn = false,
            months = 0,
            years = "0",
            fileType = CONTROL_DRUGS,
            addSubDaysToIndex = 0,
            matchWith = "none",
            beforeDays = 0,
            afterDays = 0,
            typeOfRecord = "1",
            matchingReq = false,
            enableMatchingBtn = false,
        } = input;
        const newCode = {
            name,
            owner,
            ownerID,
            codes,
            _id,
            // isSelected,
            // isIncluded,
            uniqueKey,
            clinicalCodeList,

            incl,
            years,
            months,
            eventCounts,
            consultCounts,
            fileType,
            excluIfOcBefIn,
            addSubDaysToIndex,
            matchWith,
            beforeDays,
            afterDays,
            typeOfRecord,
            matchingReq,
            enableMatchingBtn,
        };
        this.data.drugs.push(newCode);
    }

    async addAHDCode(input) {
        // Fetch the data here by making the API Call.
        // Assign the data to this.list by returning a new instance of the Model
        const {
            datafile,
            dispName,
            ahdCode,
            vData1,
            vData2,
            vData3,
            vData4,
            vData5,
            vData6,
            data1,
            data2,
            data3,
            data4,
            data5,
            data6,
            name,
            description,
            codes,
            _id,
            // isSelected = false,
            uniqueKey = uuidv4(),
            incl = true,
            eventCounts = false,
            consultCounts = false,
            excluIfOcBefIn = false,
            months = 0,
            //TODO: StudyObj query field removal changes
            // query = {},
            years = "0",
            fileType = CONTROL_AHD,
            addSubDaysToIndex = 0,
            matchWith = "none",
            beforeDays = 0,
            afterDays = 0,
            typeOfRecord = "1",
            matchingReq = false,
            enableMatchingBtn = false,
        } = input;

        const newCode = {
            datafile,
            dispName,
            ahdCode,
            vData1,
            vData2,
            vData3,
            vData4,
            vData5,
            vData6,
            data1,
            data2,
            data3,
            data4,
            data5,
            data6,
            name,
            description,
            codes,
            _id,
            // isSelected,
            // isIncluded,
            uniqueKey,
            //TODO: StudyObj query field removal changes
            // query,
            incl,
            years,
            months,
            eventCounts,
            consultCounts,
            fileType,
            excluIfOcBefIn,
            addSubDaysToIndex,
            matchWith,
            beforeDays,
            afterDays,
            typeOfRecord,
            matchingReq,
            enableMatchingBtn,
        };
        this.data.ahds.push(newCode);
    }

    async create() {
        if (this.dirty === false) {
            this.data = new Match();
            this.dirty = true;
        }
    }
}

export default new MatchStore();
