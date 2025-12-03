import EventEmitter from "events";
import { Client } from "@stomp/stompjs";

import events from "../lib/events";
import jobStatus from "../state/store/study/job-status";

/* eslint-disable no-console */

class Socket extends EventEmitter {
    constructor() {
        super();
        this.url = null;
        this.socket = null;
        this.reconnect = false;
        this.timeout = null;
    }

    connect(url) {
        const client = new Client({
            brokerURL: url,
            // debug: function (str) {
            // },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = function (/*frame*/) {
            client.subscribe("/topic/messages", function (/*data*/) {
                events.emit("new.message");
            });

            client.subscribe("/topic/jobStatusChanged", function (data) {
                const enabled = data.body === "true";
                jobStatus.setStatus(data.body);
                if (enabled) {
                    events.emit("job.enable");
                } else {
                    events.emit("job.disable");
                }
            });
        };

        client.onStompError = function (frame) {
            console.log("Broker reported error: " + frame.headers["message"]);
            console.log("Additional details: " + frame.body);
        };

        client.activate();
        this.socket = client;
    }

    disconnect() {
        this.reconnect = false;

        if (this.socket) {
            // this.socket.close();
            this.socket.deactivate();
            this.socket = null;
        }

        this.emit("disconnect");
    }
}

const ws = new Socket();
export { ws, Socket };
