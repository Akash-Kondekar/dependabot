import { observable, makeObservable } from "mobx";
import Model from "../../base";

export default class Analysis extends Model {
    constructor(data) {
        super(data);
        this.condition = this.condition ?? "";
        this.date = this.date ?? "";

        this.group = this.group ?? "";
        this.subgroup = this.subgroup ?? "";
        this.incidence = this.incidence ?? "";
        this.prevalence = this.prevalence ?? "";
        this.numerator = this.numerator ?? "";

        this.denominator = this.denominator ?? "";
        this.lowerCi = this.lowerCi ?? "";
        this.upperCi = this.upperCi ?? "";

        makeObservable(this, {
            condition: observable,
            date: observable,

            group: observable,
            subgroup: observable,
            incidence: observable,
            prevalence: observable,
            numerator: observable,

            denominator: observable,

            lowerCi: observable,
            upperCi: observable,
        });
    }
}
