import { makeObservable, observable } from "mobx";
import Model from "../base";

export default class ExtractionTelemetry extends Model {
    constructor(data) {
        super(data);
        this.id = this.id ?? undefined;
        this.clientId = this.clientId ?? undefined;
        this.dedicatedServiceUser = this.dedicatedServiceUser ?? 0;
        this.sharedServiceUser = this.sharedServiceUser ?? 0;
        this.totalEffectiveServiceUser = this.totalEffectiveServiceUser ?? 0.0;
        this.fullDbs = this.fullDbs ?? 0.0;
        this.pilotRuns = this.pilotRuns ?? 0.0;
        this.addons = this.addons ?? 0.0;
        this.timestamp = this.timestamp ?? undefined;
        this.waitingTimePoint = this.waitingTimePoint ?? 0;

        makeObservable(this, {
            id: observable,
            clientId: observable,
            dedicatedServiceUser: observable,
            sharedServiceUser: observable,
            totalEffectiveServiceUser: observable,
            fullDbs: observable,
            pilotRuns: observable,
            addons: observable,
            timestamp: observable,
            waitingTimePoint: observable,
        });
    }
}
