import { observable, makeObservable } from "mobx";
import Model from "./base";

export default class User extends Model {
    constructor(data) {
        super(data);
        this.userFullName = this.userFullName ?? undefined;
        this.userId = this.userId ?? undefined;
        this.status = this.status ?? undefined;
        this.online = this.online ?? false;
        this.role = this.role ?? undefined;
        this.roleDescription = this.roleDescription ?? undefined;
        this.organisation = this.organisation ?? undefined;
        this.licenseExpiryDate = this.licenseExpiryDate ?? undefined;
        this.token = this.token ?? undefined;
        this.registrationDate = this.registrationDate ?? undefined;
        this.termsAccepted = this.termsAccepted ?? undefined;
        makeObservable(this, {
            userFullName: observable,
            userId: observable,
            status: observable,
            online: observable,
            role: observable,
            roleDescription: observable,
            organisation: observable,
            licenseExpiryDate: observable,
            token: observable,
            registrationDate: observable,
            termsAccepted: observable,
        });
    }
}
