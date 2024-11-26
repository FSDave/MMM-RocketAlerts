const NodeHelper = require("node_helper");
const axios = require("axios");
const logger = require("logger");

module.exports = NodeHelper.create({
  start: function () {
    this.config = null;
    this.currentTimeout = null;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "START_FETCH") {
      this.config = payload;
      this.fetchAlerts();
    }
  },

  fetchAlerts: async function () {
    try {
      // Fetch current alert
      const alertResponse = await axios.get(this.config.alertUrl);
      const alertData = alertResponse.data;

      if (alertData && typeof (alertData) == "object" && Object.keys(alertData).length > 0) {
        logger.log(`Current alert detected: ${JSON.stringify(alertData)}`);
        this.sendSocketNotification("ALERT_RECEIVED", alertData);
      }

      // Fetch alert history
      const historyResponse = await axios.get(this.config.historyUrl);
      const historyData = historyResponse.data;

      if (Array.isArray(historyData)) {
        this.sendSocketNotification("HISTORY_RECEIVED", historyData);
      }
    } catch (error) {
      logger.error(`Error fetching alerts: ${error}`);
    }

    // Repeat fetch
    this.currentTimeout = setTimeout(() => this.fetchAlerts(), this.config.updateInterval);
  },

  stop: function () {
    if (this.currentTimeout) clearTimeout(this.currentTimeout);
  },
});
