import { action, computed, makeObservable } from "mobx";
import BaseStore from "../base";
import Unexposed from "../../model/study/unexposed";
import events from "../../../lib/events";

import {
    AHD_BEAN_LIST_LABEL,
    CLINICAL_CODELIST_MEDICAL_LABEL,
    CLINICAL_CODELIST_THERAPY_LABEL,
    CONTROL_AHD,
    CONTROL_DRUGS,
    CONTROL_MEDS,
} from "../../../constants";

export class UnexposedStore extends BaseStore {
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
            setMatchWithProperty: action,
            unSelectItem: action,
            setValue: action,
            hasCodes: computed,
            hasIncludedCodes: computed,
            updateFinalExclusion: action,
            updateMatchWith: action,
        });
        events.on("reset.unexposed", this.reset.bind(this));
        events.on("unexposed", this.load.bind(this));
        events.on("unexposed.hasCodes", () => {
            return this.hasCodes;
        });
    }

    observable() {
        return {
            data: [],
        };
    }

    updateFinalExclusion(label, flag) {
        // flag will be true or false - Which is the value of the Radio - Include/Exclude.

        if (flag === true) {
            // If flag is true add label from finalInclusion Array
            this.data.finalExclusion.push(label);
        }
        if (flag === false) {
            // If flag is false remove label from finalInclusion Array
            this.data.finalExclusion = this.data.finalExclusion.filter(e => e !== label);
        }
    }

    // Update Match with property, when some code which was included in
    // expose and matched control was excluded in expose.
    updateMatchWith(code) {
        for (let index = 0; index < this.data.clinicalCodeListMedical.length; index++) {
            const e = this.data.clinicalCodeListMedical[index];

            if (e.matchWith === code) {
                e.matchWith = "none";
            }
        }

        for (let index = 0; index < this.data.clinicalCodeListTherapy.length; index++) {
            const e = this.data.clinicalCodeListTherapy[index];

            if (e.matchWith === code) {
                e.matchWith = "none";
            }
        }
        for (let index = 0; index < this.data.ahdBeanList.length; index++) {
            const e = this.data.ahdBeanList[index];

            if (e.matchWith === code) {
                e.matchWith = "none";
            }
        }
    }

    reset() {
        this.dirty = false;
        this.data.studyID = undefined;
        this.set(CLINICAL_CODELIST_MEDICAL_LABEL, []);
        this.set(CLINICAL_CODELIST_THERAPY_LABEL, []);
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

    async load(data) {
        if (this.data?.studyID !== data?.studyID) {
            this.dirty = false;
        }

        if (this.dirty === false) {
            this.data = new Unexposed(data);
            this.dirty = true;
        }
    }

    getFinalExcludes() {
        const matchWithCodes = [];
        const codesNames = this.getIncludedCodesNames();
        const { includedAHDs, includedDrugs, includedReads } = codesNames;

        matchWithCodes.push(...includedAHDs, ...includedDrugs, ...includedReads);
        return matchWithCodes;
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
            incl = true,
            exposureType = 1,
            beforeDays = 0,
            addSubDaysToIndex = 0,
            clinicalCodeList,

            years = 0,
            months = 0,
            eventCounts = false,
            consultCounts = false,
            fileType = CONTROL_MEDS,
            excluIfOcBefIn = false,
            matchWith = "none",
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
            incl,
            exposureType,

            addSubDaysToIndex,
            clinicalCodeList,

            years,
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
        this.data.finalExclusion.push(filename);
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
            incl = true,
            exposureType = 1,
            // timePeriod = "0",
            years = 0,

            addSubDaysToIndex = 0,
            clinicalCodeList,

            months = 0,
            eventCounts = false,
            consultCounts = false,
            fileType = CONTROL_DRUGS,
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
            owner,
            ownerID,
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
        this.data.finalExclusion.push(filename);
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
            label,
            codes,
            // _id,
            // isSelected = false,
            incl = true,
            exposureType = 1,

            addSubDaysToIndex = 0,
            //TODO: StudyObj query field removal changes
            // query = "",

            // years = "0",
            // months = 0,
            eventCounts = false,
            consultCounts = false,
            fileType = CONTROL_AHD,
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

            addSubDaysToIndex,
            //TODO: StudyObj query field removal changes
            // query,

            // years,
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
        this.data.finalExclusion.push(label);
    }

    filterCriteria(code) {
        if (code.incl === true) return code;
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

    get numberOfIncludedCodes() {
        return [
            ...this.data.clinicalCodeListMedical,
            ...this.data.clinicalCodeListTherapy,
            ...this.data.ahdBeanList,
        ].reduce((acc, item) => {
            if (item.incl === true) {
                return acc + 1;
            }
            return acc;
        }, 0);
    }

    get numberOfExcludedCodes() {
        return [
            ...this.data.clinicalCodeListMedical,
            ...this.data.clinicalCodeListTherapy,
            ...this.data.ahdBeanList,
        ].reduce((acc, item) => {
            if (item.incl === false) {
                return acc + 1;
            }
            return acc;
        }, 0);
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
            this.data = new Unexposed();
            this.dirty = true;
        }
    }
}

export default new UnexposedStore();
