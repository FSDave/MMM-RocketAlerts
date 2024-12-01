const NodeHelper = require("node_helper");
const axios = require("axios");
const logger = require("logger");

module.exports = NodeHelper.create({
  start: function () {
    this.config = null;
    this.alertTimeout = null;
    this.historyTimeout = null;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "START_FETCH") {
      this.config = payload;
      this.fetchAlerts();
      this.fetchHistory();
    }
  },

  fetchAlerts: async function () {
    try {
      // Fetch current alert
      const alertResponse = await axios.get(this.config.alertUrl);
      const alertData = alertResponse.data;
      logger.info(`received alert data: ${JSON.stringify(alertData)}`)

      if (alertData && typeof (alertData) == "object" && Object.keys(alertData).length > 0) {
        this.sendSocketNotification("ALERT_RECEIVED", alertData);
      }

    } catch (error) {
      logger.error(`Error fetching alerts: ${error}`);
    }

    this.alertTimeout = setTimeout(() => this.fetchAlerts(), this.config.alertUpdateInterval);
  },
  fetchHistory: async function () {
    try {

      const historyResponse = await axios.get(this.config.historyUrl);
      const historyData = historyResponse.data;
      logger.info(`received history data: ${JSON.stringify(historyData)}`)
      if (Array.isArray(historyData)) {
        this.sendSocketNotification("HISTORY_RECEIVED", historyData);
      }
    } catch (error) {
      logger.error(`Error fetching alerts: ${error}`);
    }

    this.historyTimeout = setTimeout(() => this.fetchHistory(), this.config.historyUpdateInterval);
  },
  stop: function () {
    if (this.alertTimeout) clearTimeout(this.alertTimeout);
    if (this.historyTimeout) clearTimeout(this.historyTimeout);
  },
});
