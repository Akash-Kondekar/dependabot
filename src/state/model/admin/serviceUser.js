import { makeObservable, observable } from "mobx";
import Model from "../base";

export default class ServiceUser extends Model {
    constructor(data) {
        super(data);
        this.id = this.id ?? undefined;
        this.userId = this.userId ?? undefined;
        this.status = this.status ?? undefined;
        this.expiry = this.expiry ?? undefined;
        this.lastContactTime = this.lastContactTime ?? undefined;
        this.deleted = this.deleted ?? undefined;
        this.clientIdList = this.clientIdList ?? [];

        makeObservable(this, {
            id: observable,
            userId: observable,
            status: observable,
            expiry: observable,
            lastContactTime: observable,
            deleted: observable,
            clientIdList: observable,
        });
    }
}
