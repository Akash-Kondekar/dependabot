import { observable, makeObservable } from "mobx";
import Model from "../../model/base";

export default class Expose extends Model {
    constructor(data) {
        super(data);

        this.studyID = this.studyID ?? undefined;
        this.casesNeeded = this.casesNeeded ?? false;
        this.caseParseStrict = this.caseParseStrict ?? false;
        this.washOutDays = this.washOutDays ?? 0;
        //TODO: StudyObj query field removal changes
        // this.query = this.query ?? "";

        this.inclusion = this.inclusion ?? "";
        this.clinicalCodeListTherapy = this.clinicalCodeListTherapy ?? [];
        this.ahdBeanList = this.ahdBeanList ?? [];
        this.clinicalCodeListMedical = this.clinicalCodeListMedical ?? [];
        this.finalInclusion = this.finalInclusion ?? [];

        makeObservable(this, {
            studyID: observable,
            casesNeeded: observable,
            clinicalCodeListMedical: observable,
            clinicalCodeListTherapy: observable,
            ahdBeanList: observable,
            washOutDays: observable,
            caseParseStrict: observable,
            //TODO: StudyObj query field removal changes
            // query: observable,
            finalInclusion: observable,
        });
    }
}
