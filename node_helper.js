const NodeHelper = require("node_helper");
const axios = require("axios");
const Log = require("logger");

module.exports = NodeHelper.create({
  start: function () {
    Log.log("MMM-RocketAlerts helper started...");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "FETCH_ALERTS") {
      this.fetchAlerts(payload);
    }
  },

  fetchAlerts: async function (apiUrl) {
    try {
      const response = await axios.get(apiUrl);
      const redAlerts = response.data;

      if (redAlerts && redAlerts.data) {
        const alerts = redAlerts.data.map((alertCity) => {
          const alertData = {
            id: redAlerts.id,
            cities_labels: [],
            time_to_run: 0,
          };

          // Parse city data and migun time
          alertCity.forEach((city) => {
            const cityData = redAlerts.locations.find(
              (loc) => loc.label === city
            );

            if (cityData) {
              alertData.cities_labels.push({
                label: cityData.label,
                migun_time: cityData.migun_time,
              });
              alertData.time_to_run = cityData.migun_time;
            }
          });

          return alertData;
        });

        this.sendSocketNotification("ALERTS_DATA", alerts);
      }
    } catch (error) {
      Log.error("Error fetching alerts:", error);
    }
  },
});