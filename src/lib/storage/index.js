import engine from "store/src/store-engine";
import memoryStorage from "store/storages/memoryStorage";
import localStorage from "store/storages/localStorage";
import sessionStorage from "store/storages/sessionStorage";
import Storage from "./storage";

const localEngine = engine.createStore([localStorage, memoryStorage], []);
const sessionEngine = engine.createStore([sessionStorage, memoryStorage], []);

export const localStore = new Storage(localEngine);
new Storage(sessionEngine);

// export default module.exports;
