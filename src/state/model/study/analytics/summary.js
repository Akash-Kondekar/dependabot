import { observable, makeObservable } from "mobx";
import Model from "../../base";

export default class Summary extends Model {
    constructor(data) {
        super(data);
        this.covariate = this.covariate ?? "";
        this.stratum = this.stratum ?? "";

        this.overall = this.overall ?? "";
        this.sexF = this.sexF ?? "";
        this.sexM = this.sexM ?? "";
        this.sexI = this.sexI ?? "";

        this.subGroupValue = this.subGroupValue ?? "";
        this.covariateIndex = this.covariateIndex ?? "";

        makeObservable(this, {
            covariate: observable,
            stratum: observable,

            overall: observable,
            sexF: observable,
            sexM: observable,
            sexI: observable,

            subGroupValue: observable,

            covariateIndex: observable,
        });
    }
}
