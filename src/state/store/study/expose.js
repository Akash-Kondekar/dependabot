import { action, computed, makeObservable } from "mobx";
import BaseStore from "../../store/base";
import Expose from "../../model/study/expose";
import events from "../../../lib/events";

import {
    AHD_BEAN_LIST_LABEL,
    CASE_AHD,
    CASE_DRUGS,
    CASE_MEDS,
    CLINICAL_CODELIST_MEDICAL_LABEL,
    CLINICAL_CODELIST_THERAPY_LABEL,
} from "../../../constants";

export class ExposeStore extends BaseStore {
    constructor() {
        super();
        this.dirty = false;
        makeObservable(this, {
            load: action,
            addReadCode: action,
            addDrugCode: action,
            addAHDCode: action,
            create: action,
            updateValue: action,
            set: action,
            setInclude: action,
            setExposureType: action,
            setTypeOfRecord: action,
            unSelectItem: action,
            setValue: action,
            updateFinalInclusion: action,
            hasCodes: computed,
            hasIncludedCodes: computed,
            numberOfIncludedCodes: computed,
            numberOfExcludedCodes: computed,
        });

        events.on("reset.expose", this.reset.bind(this));
        events.on("exposed", this.load.bind(this));
        events.on("exposed.hasCodes", () => {
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
        this.set(CLINICAL_CODELIST_THERAPY_LABEL, []);
        this.set(CLINICAL_CODELIST_MEDICAL_LABEL, []);
        this.set(AHD_BEAN_LIST_LABEL, []);
    }

    get hasCodes() {
        return (
            this.data.clinicalCodeListMedical?.length > 0 ||
            this.data.clinicalCodeListTherapy?.length > 0 ||
            this.data.ahdBeanList?.length > 0
        );
    }

    get hasIncludedCodes() {
        return (
            (this.data.clinicalCodeListMedical?.length > 0 &&
                this.data.clinicalCodeListMedical.some(item => item.incl === true)) ||
            (this.data.clinicalCodeListTherapy?.length > 0 &&
                this.data.clinicalCodeListTherapy.some(item => item.incl === true)) ||
            (this.data.ahdBeanList?.length > 0 &&
                this.data.ahdBeanList.some(item => item.incl === true))
        );
    }

    get numberOfIncludedCodes() {
        // Create arrays safely, handling undefined or null values
        const medical = Array.isArray(this.data.clinicalCodeListMedical)
            ? this.data.clinicalCodeListMedical
            : [];
        const therapy = Array.isArray(this.data.clinicalCodeListTherapy)
            ? this.data.clinicalCodeListTherapy
            : [];
        const ahd = Array.isArray(this.data.ahdBeanList) ? this.data.ahdBeanList : [];

        // Combine the arrays and reduce
        return [...medical, ...therapy, ...ahd].reduce((acc, item) => {
            if (item.incl === true) {
                return acc + 1;
            }
            return acc;
        }, 0);
    }

    get numberOfExcludedCodes() {
        // Create arrays safely, handling undefined or null values
        const medical = Array.isArray(this.data.clinicalCodeListMedical)
            ? this.data.clinicalCodeListMedical
            : [];
        const therapy = Array.isArray(this.data.clinicalCodeListTherapy)
            ? this.data.clinicalCodeListTherapy
            : [];
        const ahd = Array.isArray(this.data.ahdBeanList) ? this.data.ahdBeanList : [];

        // Combine the arrays and reduce
        return [...medical, ...therapy, ...ahd].reduce((acc, item) => {
            if (item.incl === false) {
                return acc + 1;
            }
            return acc;
        }, 0);
    }

    setInclude(code, index, value) {
        this.data[code][index].incl = value;
    }

    setValue(item, code, index, value) {
        this.data[code][index][item] = value;
    }

    unSelectItem(code, index) {
        this.data[code].splice(index, 1);
    }

    setExposureType(code, index, value) {
        this.data[code][index].exposureType = value;
    }

    setTypeOfRecord(code, index, value) {
        this.data[code][index].typeOfRecord = value;
    }

    set(key, value) {
        this.data[key] = value;
    }

    updateFinalInclusion(label, flag) {
        // flag will be true or false - Which is the value of the Radio - Include/Exclude.

        if (flag === true) {
            // If flag is true add label from finalInclusion Array
            this.data.finalInclusion.push(label);
        }
        if (flag === false) {
            // If flag is false remove label from finalInclusion Array
            this.data.finalInclusion = this.data.finalInclusion.filter(e => e !== label);
        }
    }

    updateValue(e) {
        const { name, value } = e.target;
        this.data[name] = value;
    }

    async load(data) {
        if (this.data?.studyID !== data?.studyID) {
            this.dirty = false;
        }
        if (this.dirty === false) {
            this.data = new Expose(data);
            this.dirty = true;
        }
    }

    async addReadCode(input) {
        // Fetch the data which is selected by the user.
        // Assign the data to this.list by returning a new instance of the Model
        const {
            filename,
            ownerID,
            owner,
            type,
            codes,
            id,
            // _id,
            // isSelected = false,
            incl = true,
            exposureType = 1,
            // timePeriod = "0",
            years = 0,
            addSubDaysToIndex = 0,
            clinicalCodeList,

            months = 0,
            eventCounts = false,
            consultCounts = false,
            fileType = CASE_MEDS,
            excluIfOcBefIn = false,

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
            ownerID,
            owner,
            type,
            codes,
            id,
            // _id,
            // isSelected,
            incl,
            exposureType,
            // timePeriod,
            years,
            addSubDaysToIndex,
            clinicalCodeList,

            months,
            eventCounts,
            consultCounts,
            fileType,
            excluIfOcBefIn,
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
        this.data.clinicalCodeListMedical.push(newReadCode);
        this.data.finalInclusion.push(filename);
        //TODO: Verify and clean up the below comment.
        // THis is not needed, as its done in the individual tabs.
        // Idea is to see, if the finalInclusion array can be prepared
        // While adding the code itself.
        // There are many places this can be done.
        // This could be ideal place.
    }

    async addDrugCode(input) {
        // Fetch the data here by making the API Call.
        // Assign the data to this.list by returning a new instance of the Model
        const {
            filename,
            ownerID,
            owner,
            codes,
            id,
            // _id,
            // isSelected = false,
            incl = true,
            exposureType = 1,
            // timePeriod = "0",
            years = 0,
            addSubDaysToIndex = 0,
            clinicalCodeList,

            months = 0,
            eventCounts = false,
            consultCounts = false,
            fileType = CASE_DRUGS,
            excluIfOcBefIn = false,
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
            ownerID,
            owner,
            codes,
            id,
            clinicalCodeList,
            // _id,
            // isSelected,
            incl,
            exposureType,
            // timePeriod,
            years,
            addSubDaysToIndex,
            months,
            eventCounts,
            consultCounts,
            fileType,
            excluIfOcBefIn,
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
        this.data.clinicalCodeListTherapy.push(newCode);
        this.data.finalInclusion.push(filename);
    }

    async addAHDCode(input) {
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
            label,
            codes,
            // _id,
            // isSelected = false,
            incl = true,
            exposureType = 1,
            // timePeriod = "0",
            // years = "0",
            addSubDaysToIndex = 0,
            //TODO: StudyObj query field removal changes
            // query = "",

            // months = "0",
            eventCounts = false,
            consultCounts = false,
            fileType = CASE_AHD,
            excluIfOcBefIn = false,
            matchWith = "none",
            beforeDays = 0,
            afterDays = 0,
            typeOfRecord = 1,
            matchingReq = false,
            enableMatchingBtn = false,
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
            label,
            codes,
            // _id,
            // isSelected,
            incl,
            exposureType,
            // timePeriod,
            // years,
            addSubDaysToIndex,
            //TODO: StudyObj query field removal changes
            // query,

            // months,
            eventCounts,
            consultCounts,
            fileType,
            excluIfOcBefIn,
            matchWith,
            beforeDays,
            afterDays,
            typeOfRecord,
            matchingReq,
            enableMatchingBtn,
            userQuery: "",
        };
        this.data.ahdBeanList.push(newCode);
        this.data.finalInclusion.push(label);
    }

    filterCriteria(code) {
        if (code.incl === true) return code;
    }

    getIncludedReadCodes() {
        return this.data.clinicalCodeListMedical.filter(code => this.filterCriteria(code));
        // .map((code) => code.name);
    }

    getIncludedDrugCodes() {
        return this.data.clinicalCodeListTherapy.filter(code => this.filterCriteria(code));
        // .map((code) => code.name);
    }

    getIncludedAHDCodes() {
        return this.data.ahdBeanList.filter(code => this.filterCriteria(code));
        // .map((code) => code.name);
    }

    getIncludedCodes() {
        return {
            includedDrugs: this.getIncludedDrugCodes(),
            includedReads: this.getIncludedReadCodes(),
            includedAHDs: this.getIncludedAHDCodes(),
        };
    }

    getIncludedReadCodesNames() {
        return this.data.clinicalCodeListMedical
            .filter(code => this.filterCriteria(code))
            .map(code => code.filename);
    }

    getIncludedDrugCodesNames() {
        return this.data.clinicalCodeListTherapy
            .filter(code => this.filterCriteria(code))
            .map(code => code.filename);
    }

    getIncludedAHDCodesNames() {
        return this.data.ahdBeanList
            .filter(code => this.filterCriteria(code))
            .map(code => code.label);
    }

    getIncludedCodesNames() {
        return {
            includedDrugs: this.getIncludedDrugCodesNames(),
            includedReads: this.getIncludedReadCodesNames(),
            includedAHDs: this.getIncludedAHDCodesNames(),
        };
    }

    getFinalIncludes() {
        const matchWithCodes = [];
        const codesNames = this.getIncludedCodesNames();
        const { includedAHDs, includedDrugs, includedReads } = codesNames;

        matchWithCodes.push(...includedAHDs, ...includedDrugs, ...includedReads);
        return matchWithCodes;
    }

    getIncludedCodeNames() {
        const obj = [];
        const rows = this.getIncludedCodesNames();
        Object.values(rows)
            .map(e => e)
            .flat()
            .map(e => obj.push({ name: e, label: e }));
        return obj;
    }

    async create() {
        if (this.dirty === false) {
            this.data = new Expose();
            this.dirty = true;
        }
    }
}

export default new ExposeStore();
