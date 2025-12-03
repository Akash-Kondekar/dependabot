import { observable, makeObservable } from "mobx";
import Model from "../../model/base";

export default class Broadcast extends Model {
    constructor(data) {
        super(data);
        this.createdBy = this.createdBy ?? undefined;
        this.createdByUserFullName = this.createdByUserFullName ?? undefined;
        this.createdOn = this.createdOn ?? undefined;

        this.messageDetails = this.messageDetails ?? undefined;
        this.messageID = this.messageID ?? undefined;
        this.messageSummary = this.messageSummary ?? undefined;

        this.severity = this.severity ?? undefined;
        this.severityDescription = this.severityDescription ?? undefined;
        this.status = this.status ?? undefined;
        this.statusDescription = this.statusDescription ?? undefined;

        makeObservable(this, {
            createdBy: observable,
            createdByUserFullName: observable,
            createdOn: observable,
            messageDetails: observable,
            messageID: observable,
            messageSummary: observable,
            severity: observable,
            severityDescription: observable,
            status: observable,
            statusDescription: observable,
        });
    }
}
