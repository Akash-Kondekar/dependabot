import { makeObservable, observable } from "mobx";
import Model from "../../model/base";
import { formatDate } from "../../../utils";

export const initialPopulationValue = {
    clinicalCodeListTherapy: [],
    ahdBeanList: [],
    clinicalCodeListMedical: [],
    inclusion: "",
    finalInclusion: [],
    casesNeeded: false,
    caseParseStrict: false,
};

export default class Period extends Model {
    constructor(data) {
        super(data);

        this.studyID = this.studyID ?? undefined; // stores jobID

        // this.selectedPractices = this.selectedPractices ?? [];
        this.studyStart = this.studyStart ?? formatDate("2020-01-01", "yyyy-MM-dd");
        // this.studyEnd =
        //   this.studyEnd ?? new Date().setDate(this.studyStart.getDate() + 1);
        this.studyEnd = this.studyEnd ?? formatDate(new Date(), "yyyy-MM-dd");

        this.addToPracticeDate1 = this.addToPracticeDate1 ?? 365;
        this.addToPracticeDate2 = this.addToPracticeDate2 ?? 365;
        this.visOrComp = this.visOrComp ?? 0;
        this.addToPatientReg = this.addToPatientReg ?? 365;
        this.minAge = this.minAge ?? 0;
        this.maxAge = this.maxAge ?? 115;
        this.maxAgeAtExit = this.maxAgeAtExit ?? 115;
        this.dbName = this.dbName ?? "";
        this.practiceOption = this.practiceOption ?? 2;
        this.numberOfPractices = this.numberOfPractices ?? 10;
        this.studyDesign = this.studyDesign ?? "COHORT";
        this.opFilename = this.opFilename ?? "";
        this.sex = this.sex ?? 0;

        this.population = this.population ?? initialPopulationValue;

        makeObservable(this, {
            studyID: observable,
            studyStart: observable,
            studyEnd: observable,
            addToPracticeDate1: observable,
            addToPracticeDate2: observable,
            // visOrComp: observable, //visOrComp is not used actively in the UI - We just need to pass the value so that the job works.
            addToPatientReg: observable,
            minAge: observable,
            maxAge: observable,
            maxAgeAtExit: observable,
            dbName: observable,
            practiceOption: observable,
            sex: observable,
            opFilename: observable,

            population: observable,
        });
    }
}
