import { observable, makeObservable } from "mobx";
import Model from "../../model/base";

export default class Document extends Model {
    constructor(data) {
        super(data);
        this.id = this.id ?? "";
        this.richText = this.richText ?? "";

        makeObservable(this, {
            id: observable,
            richText: observable,
        });
    }
}
