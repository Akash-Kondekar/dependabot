import { makeObservable, action } from "mobx";
import BaseStore from "../../store/base";
import { v4 as uuidv4 } from "uuid";
import MultipleRecords from "../../model/study/records";
import events from "../../../lib/events";

export class MultipleRecordsStore extends BaseStore {
    constructor() {
        super();
        this.dirty = false;

        makeObservable(this, {
            load: action,
            create: action,

            set: action,
            addReadCode: action,
            addDrugCode: action,
            addAHDCode: action,

            unSelectItem: action,
            setValue: action,
        });
        events.on("records", this.load.bind(this));
    }

    setValue(item, code, index, value) {
        this.data[code][index][item] = value;
    }

    unSelectItem(code, index) {
        this.data[code].splice(index, 1);
    }

    set(key, value) {
        this.data[key] = value;
    }

    observable() {
        return {
            data: [],
        };
    }

    async load(data) {
        if (this.data?.studyID !== data.studyID) {
            this.dirty = false;
        }

        if (this.dirty === false) {
            this.data = new MultipleRecords(data);
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
            typeOfRecord = 1,
            uniqueKey = uuidv4(),
            clinicalCodeList,
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
            typeOfRecord,
            uniqueKey,
            clinicalCodeList,
        };
        this.data.reads.push(newReadCode);
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
            typeOfRecord = 1,
            uniqueKey = uuidv4(),
            clinicalCodeList,
        } = input;
        const newCode = {
            filename,
            owner,
            ownerID,
            codes,
            _id,
            id,
            // isSelected,
            typeOfRecord,
            uniqueKey,
            clinicalCodeList,
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
            typeOfRecord = 1,
            uniqueKey = uuidv4(),
            //TODO: StudyObj query field removal changes
            // query = {},
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
            typeOfRecord,
            uniqueKey,
            //TODO: StudyObj query field removal changes
            // query,
        };
        this.data.ahds.push(newCode);
    }

    async create() {
        if (this.dirty === false) {
            this.data = new MultipleRecords();
            this.dirty = true;
        }
    }
}

export default new MultipleRecordsStore();
