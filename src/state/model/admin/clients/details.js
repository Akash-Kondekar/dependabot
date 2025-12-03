import { makeObservable, observable } from "mobx";
import Model from "../../base";

export default class Client extends Model {
    constructor(data) {
        super(data);
        this.name = this.name ?? "";
        this.id = this.id ?? "";
        this.description = this.description ?? "";

        this.startDate = this.startDate ?? undefined;
        this.endDate = this.endDate ?? undefined;

        this.deleted = this.deleted ?? false;
        this.domain = this.domain ?? "";
        this.subdomains = this.subdomains ?? undefined;
        this.codeBuilderAccess = this.codeBuilderAccess ?? false;
        this.studyDownloadAccess = this.studyDownloadAccess ?? false;

        makeObservable(this, {
            name: observable,
            id: observable,
            description: observable,
            startDate: observable,
            endDate: observable,
            deleted: observable,
            domain: observable,
            subdomains: observable,
            codeBuilderAccess: observable,
            studyDownloadAccess: observable,
        });
    }
}
