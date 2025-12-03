import { observable, makeObservable } from "mobx";
import Model from "../base";

export default class User extends Model {
    constructor(data) {
        super(data);
        this.userFullName = this.userFullName ?? undefined;
        this.userID = this.userID ?? undefined;
        this.deleted = this.deleted ?? undefined;
        this.statusDescription = this.statusDescription ?? false;
        this.registrationDate = this.registrationDate ?? undefined;
        this.role = this.role ?? undefined;
        this.roleDescription = this.roleDescription ?? undefined;
        this.clientName = this.clientName ?? undefined;
        this.clientID = this.clientID ?? undefined;

        makeObservable(this, {
            userID: observable,
            deleted: observable,
            statusDescription: observable,
            registrationDate: observable,
            userFullName: observable,
            role: observable,
            roleDescription: observable,
            clientName: observable,
            clientID: observable,
        });
    }
}
