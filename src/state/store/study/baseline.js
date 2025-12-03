import { action, computed, makeObservable } from "mobx";
import BaseStore from "../base";
import Baseline from "../../model/study/baseline";
import { v4 as uuidv4 } from "uuid";
import events from "../../../lib/events";

import {
    AHD_BEAN_LIST_LABEL,
    BASELINE_AHD,
    BASELINE_DRUGS,
    BASELINE_MEDS,
    CLINICAL_CODELIST_GENERIC_LABEL,
    CROSS_SECTIONAL,
    INC_PREV,
    MR_RECORDS_DEFAULT_ALL,
    UNEDITABLE_FILE,
} from "../../../constants";

export class BaselineStore extends BaseStore {
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
            // setInclude: action,
            setExposureType: action,
            setMatchWithProperty: action,
            unSelectItem: action,
            setValue: action,
            hasCodes: computed,
            removeValue: action,
        });
        events.on("reset.baseline", this.reset.bind(this));
        events.on("baseline", this.load.bind(this));
        events.on("baseline.hasCodes", () => {
            return this.hasCodes;
        });
    }

    observable() {
        return {
            data: [],
        };
    }

    reset() {
        this.dirty = false;
        this.data.studyID = undefined;
        this.set(CLINICAL_CODELIST_GENERIC_LABEL, []);
        this.set(AHD_BEAN_LIST_LABEL, []);
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

    unSelectItem(code, index) {
        this.data[code].splice(index, 1);
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

    removeValue(code, index, value) {
        delete this.data[code][index][value]; // value to be removed
    }

    async load(data, mode, studyDesign, addonMode = undefined) {
        // Fetch the data here by making the API Call.
        // Assign the data to this.list by returning a new instance of the Model

        data?.clinicalCodeList &&
            data.clinicalCodeList.forEach(element => {
                if (mode === "modify" && addonMode === "create") {
                    element.exposureType = UNEDITABLE_FILE;
                }
                if ([CROSS_SECTIONAL, INC_PREV].includes(studyDesign)) {
                    element.typeOfRecord = 3;
                }
                element.uniqueKey = uuidv4();
            });

        data?.ahdBeanList &&
            data.ahdBeanList.forEach(element => {
                if (mode === "modify" && addonMode === "create") {
                    element.exposureType = UNEDITABLE_FILE;
                }
                if ([CROSS_SECTIONAL, INC_PREV].includes(studyDesign)) {
                    element.typeOfRecord = 3;
                }
                element.uniqueKey = uuidv4();
            });

        if (data?.ahdBeanList?.length > 0) {
            this.counter = data.ahdBeanList.length;
        }

        // reset exposureType to UNEDITABLE_FILE here.

        if (this.data?.studyID !== data?.studyID) {
            this.dirty = false;
        }

        if (this.dirty === false) {
            this.data = new Baseline(data);
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
            _id,
            id,
            // isSelected = false,
            // isIncluded = "1",
            exposureType = 1,
            // matchPropertyWith = "",
            uniqueKey = uuidv4(),
            typeOfRecord = 1,
            clinicalCodeList,

            incl = true,
            years = 0,
            months = 0,
            eventCounts = false,
            consultCounts = false,
            fileType = BASELINE_MEDS,
            excluIfOcBefIn = false,
            addSubDaysToIndex = 0,
            matchWith = MR_RECORDS_DEFAULT_ALL,
            beforeDays = 0,
            afterDays = 0,
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
            _id,
            id,
            // isSelected,
            // isIncluded,
            exposureType,
            // matchPropertyWith,

            uniqueKey,
            typeOfRecord,
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
            _id,
            id,
            // isSelected = false,
            // isIncluded = "1",
            exposureType = 1,
            // timePeriod = "0",
            // continuosLength = "0",
            // matchPropertyWith = "",

            uniqueKey = uuidv4(),
            typeOfRecord = 1,
            clinicalCodeList,
            incl = true,
            years = 0,
            months = 0,
            eventCounts = false,
            consultCounts = false,
            fileType = BASELINE_DRUGS,
            excluIfOcBefIn = false,
            addSubDaysToIndex = 0,
            matchWith = MR_RECORDS_DEFAULT_ALL,
            beforeDays = 0,
            afterDays = 0,
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
            _id,
            id,
            // isSelected,
            // isIncluded,
            exposureType,
            // timePeriod,
            // continuosLength,
            // matchPropertyWith,

            uniqueKey,
            typeOfRecord,
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
            _id,
            // isSelected = false,
            // isIncluded = "1",
            exposureType = 1,
            // matchPropertyWith = "",

            uniqueKey = uuidv4(),
            typeOfRecord = 1,
            //TODO: StudyObj query field removal changes
            // query = "",
            incl = true,
            // years = "0",
            // months = "",
            eventCounts = false,
            consultCounts = false,
            fileType = BASELINE_AHD,
            excluIfOcBefIn = false,
            addSubDaysToIndex = 0,
            matchWith = MR_RECORDS_DEFAULT_ALL,
            beforeDays = 0,
            afterDays = 0,
            matchingReq = false,
            enableMatchingBtn = false,
            label,
            userQuery = "",
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
            _id,
            // isSelected,
            // isIncluded,
            exposureType,
            // matchPropertyWith,

            uniqueKey,
            typeOfRecord,
            //TODO: StudyObj query field removal changes
            // query,
            label,

            incl,
            // years,
            // months,
            eventCounts,
            consultCounts,
            fileType,
            excluIfOcBefIn,
            addSubDaysToIndex,
            matchWith,
            beforeDays,
            afterDays,
            matchingReq,
            enableMatchingBtn,
            userQuery,
        };
        this.counter++;
        newCode.label = newCode.label + "_" + this.counter;
        this.data.ahdBeanList.push(newCode);
    }

    async create() {
        if (this.dirty === false) {
            this.data = new Baseline();
            this.dirty = true;
        }
    }
}

export default new BaselineStore();
