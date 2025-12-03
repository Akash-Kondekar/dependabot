import { makeObservable, observable } from "mobx";
import Model from "../../base";

export default class DrugBank extends Model {
    constructor(data) {
        super(data);
        this.id = this.id ?? undefined;
        this.name = this.name ?? "";
        this.owner = this.owner ?? "";
        this.ownerName = this.ownerName ?? "";
        this.createdOn = this.createdOn ?? undefined;
        this.modifiedOn = this.modifiedOn ?? undefined;
        this.modifiedBy = this.modifiedBy ?? "";
        this.bankCodesSet = this.bankCodesSet ?? [];
        this.dbNames = this.dbNames ?? [];
        this.tags = this.tags ?? [];
        this.status = this.status ?? "";
        this.reviewer = this.reviewer ?? "";
        this.approvedBy = this.approvedBy ?? "";
        this.approvedOn = this.approvedOn ?? "";
        this.favoriteCount = this.favoriteCount ?? "";
        this.favoritedByUser = this.favoritedByUser ?? "";

        makeObservable(this, {
            id: observable,
            name: observable,
            owner: observable,
            ownerName: observable,
            createdOn: observable,
            modifiedOn: observable,
            modifiedBy: observable,
            bankCodesSet: observable, // This field is not present in DrugBankOnly
            dbNames: observable,
            tags: observable,
            status: observable,
            reviewer: observable,
            approvedBy: observable,
            approvedOn: observable,
            favoriteCount: observable,
            favoritedByUser: observable,
        });
    }
}
