Module.register("MMM-RocketAlerts", {
    defaults: {
      updateInterval: 60000, // 1 minute
      apiUrl: "https://www.oref.org.il/WarningMessages/alert/alerts.json", // Replace with actual API URL
    },
  
    start: function () {
      this.alerts = []; // Initialize empty alerts array
      this.getAlerts();
      this.scheduleUpdate();
    },
  
    getAlerts: function () {
      this.sendSocketNotification("FETCH_ALERTS", this.config.apiUrl);
    },
  
    scheduleUpdate: function () {
      setInterval(() => {
        this.getAlerts();
      }, this.config.updateInterval);
    },
  
    socketNotificationReceived: function (notification, payload) {
      if (notification === "ALERTS_DATA") {
        this.alerts = payload; // Update alerts with new data
        this.updateDom();
      }
    },
  
    getDom: function () {
      const wrapper = document.createElement("div");
      wrapper.className = "rocket-alerts";
  
      if (this.alerts.length === 0) {
        wrapper.innerHTML = "No alerts.";
        return wrapper;
      }
  
      this.alerts.forEach((alert) => {
        const alertDiv = document.createElement("div");
        alertDiv.className = "alert";
  
        const title = document.createElement("strong");
        title.innerText = `Alert ID: ${alert.id}`;
        alertDiv.appendChild(title);
  
        const cityList = document.createElement("ul");
        alert.cities_labels.forEach((city) => {
          const cityItem = document.createElement("li");
          cityItem.innerText = `${city.label} - Migun Time: ${city.migun_time} sec`;
          cityList.appendChild(cityItem);
        });
  
        alertDiv.appendChild(cityList);
        wrapper.appendChild(alertDiv);
      });
  
      return wrapper;
    },
  });  