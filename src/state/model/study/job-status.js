import { observable, makeObservable } from "mobx";
import Model from "../base";

export default class JobStatus extends Model {
    constructor(data) {
        super(data);
        this.allowjobsubmission = this.allowjobsubmission ?? "true";

        makeObservable(this, {
            allowjobsubmission: observable,
        });
    }
}
