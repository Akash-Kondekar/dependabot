import { observable, makeObservable } from "mobx";
import Model from "../../model/base";

export default class AnalyticsJobs extends Model {
    constructor(data) {
        super(data);
        this.jobName = this.jobName ?? "";
        this.projectName = this.projectName ?? "";

        this.status = this.status ?? "";
        this.statusDescription = this.statusDescription ?? "";

        this.projectID = this.projectID ?? "";
        this.jobID = this.jobID ?? "";

        this.submittedOn = this.submittedOn ?? "";
        this.submittedByUserID = this.submittedByUserID ?? "";

        makeObservable(this, {
            jobName: observable,
            projectName: observable,

            status: observable,
            statusDescription: observable,

            projectID: observable,

            jobID: observable,

            submittedOn: observable,
            submittedByUserID: observable,
        });
    }
}
