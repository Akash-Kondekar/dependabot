import { observable, makeObservable } from "mobx";
import Model from "../../../model/base";

export default class AHD extends Model {
    constructor() {
        super();
        this.name = undefined;
        this.description = undefined;
        this.codes = undefined;
        this.key = undefined;
        makeObservable(this, {
            name: observable,
            description: observable,
            codes: observable,
            key: observable,
        });
    }
}
