import { observable, makeObservable } from "mobx";
import Model from "./base";

export default class Dashboard extends Model {
    constructor(data) {
        super(data);

        this.latestStudies = this.latestStudies ?? [];
        this.latestMedCodes = this.latestMedCodes ?? [];
        this.latestDrugCodes = this.latestDrugCodes ?? [];

        makeObservable(this, {
            latestStudies: observable,
            latestMedCodes: observable,
            latestDrugCodes: observable,
        });
    }
}
