import { observable, makeObservable } from "mobx";
import Model from "../base";

export default class Database extends Model {
    constructor(data) {
        super(data);
        this.name = this.name ?? undefined;
        this.id = this.id ?? undefined;
        this.description = this.description ?? undefined;

        this.startDate = this.startDate ?? undefined;
        this.endDate = this.endDate ?? undefined;

        this.version = this.version ?? undefined;
        this.deleted = this.deleted ?? undefined;
        this.submission = this.submission ?? true;
        this.extraction = this.extraction ?? true;
        this.extractionStatus = this.extractionStatus ?? undefined;
        this.submissionStatus = this.submissionStatus ?? undefined;

        makeObservable(this, {
            name: observable,
            id: observable,
            description: observable,
            startDate: observable,
            endDate: observable,
            version: observable,
            deleted: observable,
            submission: observable,
            extraction: observable,
            extractionStatus: observable,
            submissionStatus: observable,
        });
    }
}
