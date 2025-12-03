export default class Storage {
    constructor(store, options = {}) {
        // super();

        this.store = store;
        this.namespace = options.namespace || "vs";
    }

    set(key, value) {
        let _key = `${this.namespace}:${key}`;
        this.store.set(_key, value);
    }

    get(key, fallback) {
        let _key = `${this.namespace}:${key}`;
        let value = this.store.get(_key);

        if (value === undefined && fallback !== undefined) {
            return fallback;
        }

        return value;
    }

    remove(key) {
        let _key = `${this.namespace}:${key}`;
        this.store.remove(_key);
    }

    reset() {
        this.store.clearAll();
    }
}
