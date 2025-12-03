import { makeObservable, observable } from "mobx";
import Model from "../../model/base";
import { GetJobStatusDesc } from "../../../constants/index.jsx";

export default class Job extends Model {
    constructor(data) {
        super(data);
        this.uuid = this.uuid ?? "";
        this.userID = this.userID ?? "";
        this.studyName = this.studyName ?? "";

        this.status = this.status ?? "";
        if (data.statusDescription) {
            this.statusDescription = data.statusDescription;
        } else if (data?.status || this.status) {
            this.statusDescription = GetJobStatusDesc(data?.status || this.status);
        } else {
            this.statusDescription = "";
        }
        this.studyObject = this.studyObject ?? "";

        this.projectID = this.projectID ?? "";
        this.priority = this.priority ?? "";

        this.jobID = this.jobID ?? "";

        makeObservable(this, {
            uuid: observable,
            userID: observable,
            studyName: observable,

            status: observable,
            statusDescription: observable,

            studyObject: observable,

            projectID: observable,
            priority: observable,

            jobID: observable,
        });
    }
}
