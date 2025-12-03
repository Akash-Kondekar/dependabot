import { observable, makeObservable } from "mobx";
import Model from "../../model/base";

export default class Unexposed extends Model {
    constructor(data) {
        super(data);

        this.studyID = this.studyID ?? undefined;
        this.ctrlsNeeded = this.ctrlsNeeded ?? false;
        this.controlParseStrict = this.controlParseStrict ?? false;

        this.clinicalCodeListTherapy = this.clinicalCodeListTherapy ?? [];
        this.ahdBeanList = this.ahdBeanList ?? [];
        this.clinicalCodeListMedical = this.clinicalCodeListMedical ?? [];
        //TODO: StudyObj query field removal changes
        // this.query = this.query ?? "";

        this.exclusion = this.exclusion ?? "";

        this.matchCtrls = this.matchCtrls ?? false;

        this.matchOnlyPrimaryExpo = this.matchOnlyPrimaryExpo ?? false;
        this.matPriExpoBefDays = this.matPriExpoBefDays ?? 0;
        this.matPriExpoAftDays = this.matPriExpoAftDays ?? 0;

        this.controlSelectionMethod = this.controlSelectionMethod ?? 1;

        this.noOfCtrl = this.noOfCtrl ?? 2;
        this.ctrlAgeRange = this.ctrlAgeRange ?? 1;
        this.matchGender = this.matchGender ?? 1;

        this.matchRegDate = this.matchRegDate ?? false;
        this.ctrlReg = this.ctrlReg ?? 0;

        this.matchOnEthnicity = this.matchOnEthnicity ?? false;
        this.matchTownsend = this.matchTownsend ?? false;

        this.withRepetition = this.withRepetition ?? false;
        this.canCasesBeControls = this.canCasesBeControls ?? false;
        this.pharmacoEpiDesign = this.pharmacoEpiDesign ?? 1;
        this.propensityScore = this.propensityScore ?? false;
        this.finalExclusion = this.finalExclusion ?? [];

        makeObservable(this, {
            studyID: observable,
            ctrlsNeeded: observable,
            clinicalCodeListMedical: observable,
            clinicalCodeListTherapy: observable,
            ahdBeanList: observable,
            controlParseStrict: observable,
            //TODO: StudyObj query field removal changes
            // query: observable,

            matchCtrls: observable,
            matchOnlyPrimaryExpo: observable,
            matPriExpoBefDays: observable,
            matPriExpoAftDays: observable,

            controlSelectionMethod: observable,
            noOfCtrl: observable,
            ctrlAgeRange: observable,
            matchGender: observable,

            matchRegDate: observable,
            ctrlReg: observable,
            matchOnEthnicity: observable,
            matchTownsend: observable,
            // controlParseStrict: observable,

            withRepetition: observable,
            canCasesBeControls: observable,
            pharmacoEpiDesign: observable,
            propensityScore: observable,

            finalExclusion: observable,
        });
    }
}
