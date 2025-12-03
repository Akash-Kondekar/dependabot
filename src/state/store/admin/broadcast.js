import { action, makeObservable, computed } from "mobx";
import { v4 as uuid } from "uuid";
import BaseStore from "../base";
import http from "../../../lib/http";
import BroadCast from "../../model/admin/broadcast";
import events from "../../../lib/events";
import { ShowError } from "../../../components/Common";
const STAGGER_ID = uuid();

export class Broadcast extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            load: action,
            loadAdmin: action,
            save: action,
            setLoading: action,
            setMessages: action,
            setMessagesAdmin: action,
            removeMessage: action,
            busy: computed,
        });
        events.on("new.message", this.load.bind(this));
    }

    observable() {
        return {
            messages: [],
            messagesAdmin: [],
            loading: false,
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    setMessages(messages) {
        this.messages = messages;
    }

    setMessagesAdmin(messages) {
        this.messagesAdmin = messages;
    }

    get busy() {
        return this.loading;
    }

    async load() {
        try {
            this.setLoading(true);
            let { data } = await http.get("users/messages").stagger(STAGGER_ID);
            const messages = data.data.messageDetails.map(entry => {
                return new BroadCast(entry);
            });
            this.setMessages(messages);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(
                    error.errorDesc ||
                        "Something went wrong. Please Connect with the Administrator."
                );
            }
        } finally {
            this.setLoading(false);
        }
    }

    async removeMessage(messageId) {
        try {
            this.setLoading(true);

            let { data } = await http.delete("admin/messages/" + messageId).stagger(STAGGER_ID);
            const messages = data.data.messageDetails.map(entry => {
                return new BroadCast(entry);
            });

            this.setMessagesAdmin(messages);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(
                    error.errorDesc ||
                        "Something went wrong. Please Connect with the Administrator."
                );
            }
        } finally {
            this.setLoading(false);
        }
    }

    async loadAdmin() {
        try {
            this.setLoading(true);
            let { data } = await http.get("admin/messages").stagger(STAGGER_ID);
            const messages = data.data.messageDetails.map(entry => {
                return new BroadCast(entry);
            });
            this.setMessagesAdmin(messages);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(
                    error.errorDesc ||
                        "Something went wrong. Please Connect with the Administrator."
                );
            }
        } finally {
            this.setLoading(false);
        }
    }

    async save(payload) {
        try {
            this.setLoading(true);
            let { data } = await http.post("admin/messages", payload).stagger(STAGGER_ID);

            if (data?.errorDetails?.errorCode === 0) {
                const messages = data.data.messageDetails.map(entry => {
                    return new BroadCast(entry);
                });
                this.setMessagesAdmin(messages);
                return true;
            } else {
                return false;
            }
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(
                    error.errorDesc ||
                        "Something went wrong. Please Connect with the Administrator."
                );
                return false;
            }
        } finally {
            this.setLoading(false);
        }
    }
}

export default new Broadcast();
