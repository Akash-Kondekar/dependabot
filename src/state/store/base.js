import { extendObservable } from "mobx";
import events from "../../lib/events";

export default class BaseStore {
    constructor() {
        let data = this.observable();
        events.setMaxListeners(events.getMaxListeners() + 1);
        if (this.observable instanceof Function) {
            extendObservable(this, data);

            // TODO : Reset the store on Logout - event.
        }
    }
}
