import { makeObservable, observable } from "mobx";
import Model from "../../base";

export default class MasterDrug extends Model {
    constructor(data) {
        super(data);
        this.rowId = data.rowId ?? data.rowid ?? undefined;
        this.dataId = data.dataId ?? data.dataid ?? "";
        this.description = this.description ?? "";
        this.bnf1 = this.bnf1 ?? "";
        this.bnf2 = this.bnf2 ?? "";
        this.bnf3 = this.bnf3 ?? "";
        this.atc = this.atc ?? "";
        this.additionalCode1 = this.additionalCode1 ?? "";
        this.dbName = this.dbName ?? "";
        this.frequency = this.frequency ?? undefined;
        this.objectAsList = this.objectAsList ?? [];

        makeObservable(this, {
            rowId: observable,
            dataId: observable,
            description: observable,
            bnf1: observable,
            bnf2: observable,
            bnf3: observable,
            atc: observable,
            additionalCode1: observable,
            dbName: observable,
            frequency: observable,
            objectAsList: observable,
        });
    }
}
