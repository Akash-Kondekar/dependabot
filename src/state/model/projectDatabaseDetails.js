import { observable, makeObservable } from "mobx";
import Model from "./base";

export default class ProjectDatabaseDetails extends Model {
    constructor(data) {
        super(data);
        this.id = this.id ?? "";
        this.name = this.name ?? "";
        this.version = this.version ?? "";
        this.submission = this.submission ?? false;
        this.extraction = this.extraction ?? false;
        this.dbNameWithVersion = this.dbNameWithVersion ?? "";

        makeObservable(this, {
            id: observable,
            name: observable,
            version: observable,
            submission: observable,
            extraction: observable,
            dbNameWithVersion: observable,
        });
    }
}
