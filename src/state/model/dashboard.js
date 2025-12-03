import { observable, makeObservable } from "mobx";
import Model from "./base";

export default class Dashboard extends Model {
    constructor(data) {
        super(data);

        this.userActivities = this.userActivities ?? [];
        this.projectActivities = this.projectActivities ?? [];

        makeObservable(this, {
            userActivities: observable,
            projectActivities: observable,
        });
    }
}
