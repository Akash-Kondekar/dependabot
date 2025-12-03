import { makeObservable, observable } from "mobx";
import Model from "../../base";

export default class MasterMedical extends Model {
    constructor(data) {
        super(data);
        this.rowId = data.rowId ?? data.rowid ?? undefined;
        this.dataId = data.dataId ?? data.dataid ?? "";
        this.description = this.description ?? "";
        this.clinicalcode1 = this.clinicalcode1 ?? "";
        this.clinicalcode2 = this.clinicalcode2 ?? "";
        this.clinicalcode3 = this.clinicalcode3 ?? "";
        this.dbName = this.dbName ?? "";
        this.frequency = this.frequency ?? undefined;
        this.objectAsList = this.objectAsList ?? [];

        makeObservable(this, {
            rowId: observable,
            dataId: observable,
            description: observable,
            clinicalcode1: observable,
            clinicalcode2: observable,
            clinicalcode3: observable,
            dbName: observable,
            frequency: observable,
            objectAsList: observable,
        });
    }
}
