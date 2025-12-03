import { observable, makeObservable } from "mobx";
import Model from "./base";

export default class Project extends Model {
    constructor(data) {
        super(data);
        this.projectName = this.projectName ?? undefined;
        this.createdOn = this.createdOn ?? undefined;
        this.projectOwnerID = this.projectOwnerID ?? undefined;
        this.projectOwnerFullName = this.projectOwnerFullName ?? undefined;
        this.projectID = this.projectID ?? undefined;
        this.projectStatus = this.projectStatus ?? undefined;
        this.projectStatusDescription = this.projectStatusDescription ?? undefined;
        this.jobs = this.jobs ?? [];
        this.clientID = this.clientID ?? undefined;
        // this.team = this.team ?? [];

        makeObservable(this, {
            projectID: observable,
            projectName: observable,
            projectOwnerID: observable,
            projectStatus: observable,
            jobs: observable,
            clientID: observable,
        });
    }
}
