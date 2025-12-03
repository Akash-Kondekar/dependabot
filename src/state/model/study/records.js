import { observable, makeObservable } from "mobx";
import Model from "../../model/base";

export default class MultipleRecords extends Model {
    constructor(data) {
        super(data);

        this.studyID = this.studyID ?? undefined;

        this.needConsultation = this.needConsultation ?? "0";
        this.consultation = this.consultation ?? "0";
        this.needTimeSeries = this.needTimeSeries ?? "0";
        this.timeSeriesPeriod = this.timeSeriesPeriod ?? "1";

        this.drugs = this.drugs ?? [];
        this.ahds = this.ahds ?? [];
        this.reads = this.reads ?? [];

        makeObservable(this, {
            studyID: observable,

            needConsultation: observable,
            consultation: observable,
            needTimeSeries: observable,
            timeSeriesPeriod: observable,

            reads: observable,
            drugs: observable,
            ahds: observable,
        });
    }
}
