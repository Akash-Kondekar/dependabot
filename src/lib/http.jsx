import axios from "axios";
import qs from "qs";
import EventEmitter from "events";
import { localStore } from "./storage";
import session from "../state/store/session";

export class HttpClient extends EventEmitter {
    constructor() {
        super();

        this.staggered = {};
        this.active = 0;
        this.getNewToken = false;

        let options = {
            baseURL: (import.meta.env.VITE_APP_API_VIP || "https://localhost:8443") + "/dexter",
            paramsSerializer: function (params) {
                return qs.stringify(params);
            },
        };

        // create the axios instance
        this.instance = axios.create(options);

        //attach response interceptors
        this.instance.interceptors.response.use(
            this._onResponseSuccess.bind(this),
            this._onResponseError.bind(this)
        );

        //attach request interceptors
        this.instance.interceptors.request.use(this._onRequestSuccess.bind(this));

        // this.instance.interceptors.request.use(this._onRequestSuccess.bind(this));
        this.instance.interceptors.response.use(this._onResponseSuccess.bind(this));
        //delayed complete event
        this.$complete = () => setTimeout(this._complete.bind(this), 100);
    }

    /**
     * Change the client configuration
     */
    configure(config) {
        // istanbul ignore else
        if (config) {
            this.instance.defaults.baseURL = config.baseURL;
        }

        // istanbul ignore else
        if (config.adapter) {
            this.instance.defaults.adapter = config.adapter;
        }
    }

    /**
     * Perform a HTTP Get
     */
    get(path, data) {
        return this.request({ url: path, method: "get", params: data });
    }

    /**
     * Perform a HTTP Post
     */
    post(path, data, options = {}) {
        return this.request({
            url: path,
            method: "post",
            data: data,
            ...options,
        });
    }

    /**
     * Perform a HTTP Delete
     */
    delete(path, data) {
        return this.request({ url: path, method: "delete", params: data });
    }

    /**
     * Perform a HTTP Put
     */
    put(path, data) {
        return this.request({ url: path, method: "put", data: data });
    }

    /**
     * Perform a HTTP Request
     */
    request(options) {
        let source = axios.CancelToken.source();
        let token = source.token;

        options.CancelToken = token;

        let req = this.instance.request(options).catch(error => {
            if (error.response) {
                error.status = error.response.status;
            }

            // return a promise which wont be resolved.

            if (axios.isCancel(error)) {
                req.canceled = true;
                return new Promise(() => {});
            }

            return Promise.reject(error);
        });

        // Define the Cancel function
        req.cancel = () => {
            return source.cancel();
        };

        req.stagger = key => {
            let old = this.staggered[key];
            if (old) {
                old.cancel();
            }
            this.staggered[key] = req;
            return req.finally(() => {
                this.staggered[key] = null;
            });
        };

        return req;
    }

    /**
     * Request Success Interceptor
     */
    _onRequestSuccess(config) {
        const id = localStore.get("user");
        const token = localStore.get("auth.token");
        const type = localStore.get("type");

        config.headers["X-Requester-ID"] = id;
        config.headers["Authorization"] = `${type} ${token}`;

        this._start();
        return config;
    }

    /**
     * Response Success Interceptor
     */
    _onResponseSuccess(res) {
        this.$complete();
        return res;
    }

    /**
     * Response Error Interceptor
     */
    async _onResponseError(error) {
        if (error.response.status === 401 && !this.getNewToken) {
            this.getNewToken = true;
            const config = error.config;
            config.headers["Content-Type"] = "application/json";
            try {
                config.getNewToken = true;

                const payload = {
                    refreshToken: localStore.get("auth.refreshToken"),
                };

                if (!localStore.get("auth.refreshToken")) {
                    return Promise.reject("Token cannot be empty");
                }

                const { data } = await axios.post(
                    `${error.config.baseURL}/refresh-token`,
                    payload,
                    config
                );

                const response = data.data;
                localStore.set("auth.token", response.token);

                const token = localStore.get("auth.token");
                const type = localStore.get("type");
                config.headers["Authorization"] = `${type} ${token}`;

                this.getNewToken = false;
                return this.instance(config);
            } catch (error) {
                this.getNewToken = false;
                session.removeTokenFromStore();
                session.loggedIn = false;
                return Promise.reject(error);
            }
        } else {
            this.$complete();
            return Promise.reject(error);
        }
    }

    /**
     * Start a Job
     */
    _start() {
        if (this.active === 0) {
            this.emit("loading", true);
        }
        this.active++;
    }

    /**
     * Complete a Job
     */
    _complete() {
        this.active--;
        if (!this.active) {
            this.emit("loading", false);
        }
    }
}

const http = new HttpClient();
export default http;
