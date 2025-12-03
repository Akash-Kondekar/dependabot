import { observable, makeObservable } from "mobx";
import Model from "../../model/base";

export default class Match extends Model {
    constructor(data) {
        super(data);
        this.studyID = this.studyID ?? undefined;

        this.matchControl = this.matchControl ?? "0";

        this.matchPrimaryExposure = this.matchPrimaryExposure ?? "0";
        this.beforeDays = this.beforeDays ?? 0;
        this.afterDays = this.afterDays ?? 0;

        this.practice = this.practice ?? "0";

        this.noOfCtrl = this.noOfCtrl ?? 2;
        this.ctrlAR = this.ctrlAR ?? "1";
        this.controlGender = this.controlGender ?? "0";

        // this.matchPatientRegistration = this.matchPatientRegistration ?? "0";
        this.registrationMonths = this.registrationMonths ?? "0";

        this.matchPatientEthnicity = this.matchPatientEthnicity ?? "0";
        this.matchPatientScore = this.matchPatientScore ?? "0";

        this.drugs = this.drugs ?? [];
        this.ahds = this.ahds ?? [];
        this.reads = this.reads ?? [];
        this.caseParseStrict = this.caseParseStrict ?? false;
        this.repetition = this.repetition ?? "0";
        this.becomeControl = this.becomeControl ?? "0";
        this.controlIndexDate = this.controlIndexDate ?? "1";
        this.matchPropensityScore = this.matchPropensityScore ?? "0";

        makeObservable(this, {
            studyID: observable,

            reads: observable,
            drugs: observable,
            ahds: observable,

            matchControl: observable,
            matchPrimaryExposure: observable,
            beforeDays: observable,
            afterDays: observable,

            practice: observable,
            noOfCtrl: observable,
            ctrlAR: observable,
            controlGender: observable,

            // matchPatientRegistration: observable,
            registrationMonths: observable,
            matchPatientEthnicity: observable,
            matchPatientScore: observable,
            caseParseStrict: observable,

            repetition: observable,
            becomeControl: observable,
            controlIndexDate: observable,
            matchPropensityScore: observable,
        });
    }
}
