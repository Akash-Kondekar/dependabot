import { observable, makeObservable } from "mobx";
import Model from "../../base";

// This is a 1-1 replacement for AHDCodes.java
export default class AHDCodes extends Model {
    constructor(data) {
        super(data);
        this.ahdcode = this.ahdcode ?? "";
        this.datafile = this.datafile ?? "";
        this.description = this.description ?? "";
        this.data1 = this.data1 ?? "";
        this.data2 = this.data2 ?? "";
        this.data3 = this.data3 ?? "";
        this.data4 = this.data4 ?? "";
        this.data5 = this.data5 ?? "";
        this.data6 = this.data6 ?? "";
        this.dbName = this.dbName ?? "";

        makeObservable(this, {
            ahdcode: observable,
            datafile: observable,
            description: observable,
            data1: observable,
            data2: observable,
            data3: observable,
            data4: observable, // This field is not present in DrugBankOnly
            data5: observable,
            data6: observable,
            dbName: observable,
        });
    }
}
