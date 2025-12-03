import { observable, makeObservable } from "mobx";
import Model from "./base";

export default class UserClientDetails extends Model {
    constructor(data) {
        super(data);
        this.clientId = this.clientId ?? undefined;
        this.clientDeleted = this.clientDeleted ?? undefined;
        this.clientDescription = this.clientDescription ?? undefined;
        this.clientDomain = this.clientDomain ?? undefined;
        this.clientEndDate = this.clientEndDate ?? undefined;
        this.clientStartDate = this.clientStartDate ?? undefined;
        this.clientName = this.clientName ?? undefined;
        makeObservable(this, {
            clientId: observable,
            clientDeleted: observable,
            clientDescription: observable,
            clientDomain: observable,
            clientEndDate: observable,
            clientStartDate: observable,
            clientName: observable,
        });
    }
}
