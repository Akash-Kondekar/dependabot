import { observable, makeObservable } from "mobx";
import Model from "../../model/base";

export default class Codes extends Model {
    constructor(read, drug, ahd) {
        super();
        this.read = read;
        this.drug = drug;
        this.ahd = ahd;

        makeObservable(this, {
            read: observable,
            drug: observable,
            ahd: observable,
        });
    }
}
