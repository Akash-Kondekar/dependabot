import { makeObservable, observable } from "mobx";
import Model from "../../base";

export default class DataExtractionReport extends Model {
    constructor(data) {
        super(data);
        this.nodeType = this.nodeType ?? "";
        this.line = this.line ?? "";

        this.children = this.children ?? [];

        makeObservable(this, {
            nodeType: observable,
            line: observable,

            children: observable,
        });
    }
}
