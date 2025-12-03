import EventEmitter from "events";

export class EventBus extends EventEmitter {}
export default new EventBus();
