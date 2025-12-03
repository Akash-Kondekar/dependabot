import { makeObservable, observable } from "mobx";
import Model from "../../model/base";

export default class Database extends Model {
    constructor(data) {
        super(data);

        this.id = this.id ?? undefined;
        this.name = this.name ?? undefined;
        this.version = this.version ?? undefined;

        makeObservable(this, {
            id: observable,
            name: observable,
            version: observable,
        });
    }
}
