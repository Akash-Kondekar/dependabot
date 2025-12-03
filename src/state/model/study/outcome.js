import { observable, makeObservable } from "mobx";
import Model from "../../model/base";

export default class Outcome extends Model {
    constructor(data) {
        super(data);

        this.studyID = this.studyID ?? undefined;
        this.countConsult = this.countConsult ?? false;

        this.clinicalCodeList = this.clinicalCodeList ?? [];
        this.ahdBeanList = this.ahdBeanList ?? [];

        makeObservable(this, {
            studyID: observable,
            ahdBeanList: observable,
            clinicalCodeList: observable,
            // projectName: observable,
            // projectID: observable,
            countConsult: observable,
        });
    }
}
