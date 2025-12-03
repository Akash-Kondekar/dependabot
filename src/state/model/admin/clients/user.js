import { observable, makeObservable } from "mobx";
import Model from "../base";

export default class User extends Model {
    constructor(data) {
        super(data);
        this.userFullName = this.userFullName ?? undefined;
        this.userID = this.userID ?? undefined;
        this.status = this.status ?? undefined;

        makeObservable(this, {
            userFullName: observable,
            userID: observable,
            status: observable,
        });
    }
}
