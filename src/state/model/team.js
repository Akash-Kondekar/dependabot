import { observable, makeObservable } from "mobx";
import Model from "./base";

export default class Team extends Model {
    constructor(data) {
        super(data);
        this.userID = this.userID ?? undefined;
        this.userFullName = this.userFullName ?? undefined;
        this.status = this.status ?? undefined;
        this.statusDescription = this.statusDescription ?? undefined;
        this.role = this.role ?? undefined;
        this.roleDescription = this.roleDescription ?? undefined;

        // this.team = this.team ?? [];

        makeObservable(this, {
            status: observable,
            userID: observable,
            userFullName: observable,
            role: observable,
        });
    }
}
