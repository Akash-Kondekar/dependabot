import { makeObservable, observable } from "mobx";
import Model from "../../model/base";
import { MR_RECORDS_DEFAULT_ALL } from "../../../constants";

export default class NewBaseLine extends Model {
    constructor(data) {
        super(data);

        this.studyID = this.studyID ?? undefined;

        this.clinicalCodeList = this.clinicalCodeList ?? [];
        this.ahdBeanList = this.ahdBeanList ?? [];

        this.needConsultRecords = this.needConsultRecords ?? false;
        this.consultTypeReq = this.consultTypeReq ?? MR_RECORDS_DEFAULT_ALL;
        this.needTimeSeries = this.needTimeSeries ?? false;
        this.timeSeriesLength = this.timeSeriesLength ?? 180;

        makeObservable(this, {
            studyID: observable,
            needConsultRecords: observable,
            consultTypeReq: observable,
            needTimeSeries: observable,
            timeSeriesLength: observable,

            clinicalCodeList: observable,
            ahdBeanList: observable,
        });
    }
}
