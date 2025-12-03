import { action, computed, makeObservable } from "mobx";
import BaseStore from "../../store/base";

import Period, { initialPopulationValue } from "../../model/study/period";
import events from "../../../lib/events";
import {
    CROSS_SECTIONAL,
    STUDY_AHD,
    STUDY_DRUGS,
    STUDY_MEDS,
    UNEDITABLE_FILE,
} from "../../../constants";
import session from "../../store/session";
import codes from "../../store/study/codes";
import { formatDate } from "../../../utils";

export class PeriodStore extends BaseStore {
    constructor() {
        super();
        this.dirty = false;

        makeObservable(this, {
            load: action,
            create: action,
            updateValue: action,
            setValue: action,
            setCodeValue: action,
            reset: action,
            areVariablesAdded: action,
            setInclude: action,
            updateFinalInclusion: action,
            setExposureType: action,
            setTypeOfRecord: action,
            unSelectItem: action,
            hasCodes: computed,
            hasIncludedCodes: computed,
            addReadCode: action,
            addDrugCode: action,
            addAHDCode: action,
            set: action,
            setPopulationValue: action,
            numberOfIncludedCodes: computed,
            numberOfExcludedCodes: computed,
        });
        events.on("reset.period", this.reset.bind(this)); // Called from src\components\Projects\ProjectDetails.jsx
    }

    observable() {
        return {
            data: [],
        };
    }

    getNewName(opFilename = "") {
        const AVF = "AVF";
        const index = opFilename.indexOf(AVF);
        if (index === -1) {
            return AVF + "1_" + opFilename;
        } else {
            const oldVersion = opFilename.substring(0, opFilename.indexOf("_")).replace(AVF, "");
            const newVersion = Number(oldVersion) + 1;
            return opFilename.replace(AVF + oldVersion, AVF + newVersion);
        }
    }

    setValue(key, value) {
        this.data[key] = value;
    }

    setCodeValue(item, code, index, value) {
        this.data[code][index][item] = value;
    }

    setPopulationValue(item, code, index, value) {
        this.data.population[code][index][item] = value;
    }

    setInclude(code, index, value) {
        this.data.population[code][index].incl = value;
    }

    updateValue(e) {
        const { name, value } = e.target;
        this.data[name] = parseInt(value);
    }

    updateFinalInclusion(label, flag) {
        // flag will be true or false - Which is the value of the Radio - Include/Exclude.

        if (flag === true) {
            // If flag is true add label from finalInclusion Array
            this.data.population.finalInclusion.push(label);
        }
        if (flag === false) {
            // If flag is false remove label from finalInclusion Array
            this.data.population.finalInclusion = this.data.population.finalInclusion.filter(
                e => e !== label
            );
        }
    }

    setExposureType(code, index, value) {
        this.data.population[code][index].exposureType = value;
    }

    setTypeOfRecord(code, index, value) {
        this.data.population[code][index].typeOfRecord = value;
    }

    unSelectItem(code, index) {
        this.data.population[code].splice(index, 1);
    }

    set(key, value) {
        this.data.population[key] = value;
    }

    reset() {
        this.dirty = false;
        this.data.studyID = undefined;
        this.data.opFilename = "";
        // dbName here points to Database ID
        this.data.dbName = undefined;
        this.data.population = initialPopulationValue;
    }

    get hasCodes() {
        return (
            this.data.population.clinicalCodeListMedical?.length > 0 ||
            this.data.population.clinicalCodeListTherapy?.length > 0 ||
            this.data.population.ahdBeanList?.length > 0
        );
    }

    get hasIncludedCodes() {
        return (
            (this.data.population.clinicalCodeListMedical?.length > 0 &&
                this.data.population.clinicalCodeListMedical.some(item => item.incl === true)) ||
            (this.data.population.clinicalCodeListTherapy?.length > 0 &&
                this.data.population.clinicalCodeListTherapy.some(item => item.incl === true)) ||
            (this.data.population.ahdBeanList?.length > 0 &&
                this.data.population.ahdBeanList.some(item => item.incl === true))
        );
    }

    get numberOfIncludedCodes() {
        return [
            ...this.data.population.clinicalCodeListMedical,
            ...this.data.population.clinicalCodeListTherapy,
            ...this.data.population.ahdBeanList,
        ].reduce((acc, item) => {
            if (item.incl === true) {
                return acc + 1;
            }
            return acc;
        }, 0);
    }

    get numberOfExcludedCodes() {
        return [
            ...this.data.population.clinicalCodeListMedical,
            ...this.data.population.clinicalCodeListTherapy,
            ...this.data.population.ahdBeanList,
        ].reduce((acc, item) => {
            if (item.incl === false) {
                return acc + 1;
            }
            return acc;
        }, 0);
    }

    filterCriteria(code) {
        if (code.incl === true) return code;
    }

    getIncludedReadCodesNames() {
        return this.data.population.clinicalCodeListMedical
            .filter(code => this.filterCriteria(code))
            .map(code => code.filename);
    }

    getIncludedDrugCodesNames() {
        return this.data.population.clinicalCodeListTherapy
            .filter(code => this.filterCriteria(code))
            .map(code => code.filename);
    }

    getIncludedAHDCodesNames() {
        return this.data.population.ahdBeanList
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

    getIncludedCodeNames() {
        const obj = [];
        const rows = this.getIncludedCodesNames();
        Object.values(rows)
            .map(e => e)
            .flat()
            .map(e => obj.push({ name: e, label: e }));
        return obj;
    }

    areVariablesAdded(response) {
        const expose =
            response?.exposed?.clinicalCodeListTherapy?.length > 0 ||
            response?.exposed?.ahdBeanList?.length > 0 ||
            response?.exposed?.clinicalCodeListMedical?.length > 0;

        const unexposed =
            response?.control?.clinicalCodeListTherapy?.length > 0 ||
            response?.control?.clinicalCodeListMedical?.length > 0 ||
            response?.control?.ahdBeanList?.length > 0;

        const baseline =
            response?.baseline?.clinicalCodeList?.length > 0 ||
            response?.control?.ahdBeanList?.length > 0;

        const outcome =
            response?.outcome?.clinicalCodeList?.length > 0 ||
            response?.control?.ahdBeanList?.length > 0;

        return expose || unexposed || baseline || outcome;
    }

    async load(response, mode, addonMode = undefined, isDraft = false) {
        // Fetch the data here by making the API Call.
        // Assign the data to this.list by returning a new instance of the Model
        if (!response) {
            return;
        }

        if (this.data.studyID !== response.jobID) {
            if (session.isUser) {
                response.studyObject.studyPeriod.practiceOption = 2;
            }
            this.data = new Period(response.studyObject.studyPeriod);
            this.data.studyID = response.jobID;
            if (mode === "modify" && !isDraft) {
                this.data.visOrComp = UNEDITABLE_FILE;
                this.data.opFilename = this.getNewName(response.addonLatestStudyName);
            }
            codes.reset();
            this.dirty = true;
            events.emit("exposed", response.studyObject.exposed);
            events.emit("unexposed", response.studyObject.control);
            // events.emit("match", response.match); //
            events.emit(
                "baseline",
                response.studyObject.baseline,
                mode,
                response.studyObject.studyPeriod.studyDesign,
                addonMode
            );

            events.emit("outcome", response.studyObject.outcome, mode, addonMode);
            events.emit("database", response.studyObject.dataSource);
            return;
        }
    }

    getNextDate(inputDate) {
        const startDate = new Date(inputDate);
        // seconds * minutes * hours * milliseconds = 1 day
        const day = 60 * 60 * 24 * 1000;

        const endDate = formatDate(new Date(startDate.getTime() + day), "yyyy-MM-dd");
        return endDate;
    }

    async create(studyDesign) {
        if (this.data?.studyID !== undefined) {
            // Or some other study was loaded previously.
            // undefined means, its  new study default value
            this.data.studyID = "";
            this.dirty = false;
        }

        if (this.dirty === false) {
            // Create a new study only when one of this is true.
            // Either Dirty is false.

            // this.data = new Period({ studyDesign: studyDesign, opFilename: "" });
            this.data = new Period();
            this.data.opFilename = "";
            this.data.studyDesign = studyDesign;

            if (studyDesign === CROSS_SECTIONAL) {
                this.setValue("studyEnd", this.getNextDate(this.data.studyStart));
            }

            this.dirty = true;
            events.emit("exposed", {});
            events.emit("unexposed", {});

            events.emit("baseline", {});
            events.emit("outcome", {});
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
            fileType = STUDY_MEDS,
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
        this.data.population.clinicalCodeListMedical.push(newReadCode);
        this.data.population.finalInclusion.push(filename);
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
            fileType = STUDY_DRUGS,
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
        this.data.population.clinicalCodeListTherapy.push(newCode);
        this.data.population.finalInclusion.push(filename);
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
            fileType = STUDY_AHD,
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
        this.data.population.ahdBeanList.push(newCode);
        this.data.population.finalInclusion.push(label);
    }
}

export default new PeriodStore();
