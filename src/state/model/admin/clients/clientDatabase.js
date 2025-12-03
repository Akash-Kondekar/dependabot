import { observable, makeObservable } from "mobx";
import Model from "../../base";

export default class ClientDatabase extends Model {
    constructor(data) {
        super(data);
        this.databaseName = this.databaseName ?? undefined;
        this.databaseId = this.databaseId ?? undefined;
        this.databaseDescription = this.databaseDescription ?? undefined;

        this.databaseStartDate = this.databaseStartDate ?? undefined;
        this.databaseEndDate = this.databaseEndDate ?? undefined;

        this.databaseVersion = this.databaseVersion ?? undefined;
        this.databaseDeleted = this.databaseDeleted ?? undefined;
        this.submission = this.submission ?? true;
        this.extraction = this.extraction ?? true;

        makeObservable(this, {
            databaseName: observable,
            databaseId: observable,
            databaseDescription: observable,
            databaseStartDate: observable,
            databaseEndDate: observable,
            databaseVersion: observable,
            databaseDeleted: observable,
            submission: observable,
            extraction: observable,
        });
    }
}
