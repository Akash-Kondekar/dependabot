import { observable, makeObservable } from "mobx";
import Model from "../../../model/base";

export default class Drug extends Model {
    constructor() {
        super();
        this.name = undefined;
        this.owner = undefined;
        this.codes = undefined;
        this.key = undefined;
        makeObservable(this, {
            key: observable,
            name: observable,
            owner: observable,
            codes: observable,
        });
    }
}
