export default class Model {
    constructor(data) {
        if (data !== undefined) {
            this.set(data);
        }
    }
    set(data) {
        for (let key in data) {
            this[key] = data[key];
        }
    }
}
