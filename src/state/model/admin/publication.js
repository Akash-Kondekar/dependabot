import { observable, makeObservable } from "mobx";
import Model from "../base";

export default class Publication extends Model {
    constructor(data) {
        super(data);
        this.createdBy = this.createdBy ?? undefined;
        this.createdByUserFullName = this.createdByUserFullName ?? undefined;
        this.createdOn = this.createdOn ?? undefined;

        this.pubID = this.pubID ?? undefined;
        this.title = this.title ?? undefined;
        this.authors = this.authors ?? undefined;

        this.publicationDate = this.publicationDate ?? undefined;
        this.journalName = this.journalName ?? undefined;
        this.doi = this.doi ?? undefined;
        this.pmcID = this.pmcID ?? undefined;
        this.pmID = this.pmID ?? undefined;

        makeObservable(this, {
            createdBy: observable,
            createdByUserFullName: observable,
            createdOn: observable,
            pubID: observable,
            title: observable,
            authors: observable,
            publicationDate: observable,
            journalName: observable,
            doi: observable,
            pmcID: observable,
            pmID: observable,
        });
    }
}
