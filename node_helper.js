const NodeHelper = require("node_helper");
const fetch = require("node-fetch");
const Log = require("logger");

function log(level, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    Log.log(logMessage.trim());
}

module.exports = NodeHelper.create({
    start() {
        log("info", "Node Helper for MMM-RocketAlerts started.");
        this.config = null;
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "INIT") {
            this.config = payload;
            this.startFetchingData();
        }
    },

    startFetchingData() {
        if (!this.config) return;

        setInterval(() => {
            this.fetchData("https://www.oref.org.il/WarningMessages/alert/alerts.json", "CURRENT_ALERT");
            this.fetchData("https://www.oref.org.il/WarningMessages/alert/History/AlertsHistory.json", "ALERT_HISTORY", true);
        }, this.config.updateInterval);
    },

    async fetchData(url, notification, isHistory = false) {
        try {
            log("info", `Fetching data from ${url}`);
            const response = await fetch(url);
            const data = await response.json();
            log("info", `Data fetched successfully from ${url}`);

            if (isHistory) {
                this.sendSocketNotification(notification, data.slice(0, 5));
            } else {
                this.sendSocketNotification(notification, data);
            }
        } catch (error) {
            log("error", `Error fetching data from ${url}: ${error.message}`);
        }
    },
});
