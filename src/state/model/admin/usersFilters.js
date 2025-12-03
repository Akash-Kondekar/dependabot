import { observable, makeObservable } from "mobx";
import Model from "../base";

export default class UserFilters extends Model {
    constructor(data) {
        super(data);
        this.uploadedResults = this.uploadedResults ?? undefined;

        makeObservable(this, {
            uploadedResults: observable,
        });
    }
}
