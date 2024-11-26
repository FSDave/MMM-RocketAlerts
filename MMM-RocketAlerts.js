Module.register("MMM-RocketAlerts", {
    defaults: {
      updateInterval: 60000, // 1 minute
      apiUrl: "https://www.oref.org.il/WarningMessages/alert/alerts.json", // Replace with actual API URL
    },
  
    start: function () {
      this.alerts = []; // Initialize empty alerts array
      this.getAlerts();
      this.scheduleUpdate();
      this.injectCustomStyles(); // Inject CSS for flashing effect
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
        this.checkForSiren(); // Check for sirens and trigger flashing
      }
    },
  
    checkForSiren: function () {
      const hasAlerts = this.alerts && this.alerts.length > 0;
  
      // Add or remove the flashing class based on alerts
      if (hasAlerts) {
        this.startFlashing();
      } else {
        this.stopFlashing();
      }
    },
  
    startFlashing: function () {
      const body = document.body;
      if (!body.classList.contains("flash-red")) {
        body.classList.add("flash-red");
      }
    },
  
    stopFlashing: function () {
      const body = document.body;
      body.classList.remove("flash-red");
    },
  
    injectCustomStyles: function () {
      const style = document.createElement("style");
      style.innerHTML = `
        .flash-red {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: red;
          z-index: 9999;
          animation: flash 1s infinite;
          pointer-events: none;
        }
  
        @keyframes flash {
          0% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.5;
          }
        }
      `;
      document.head.appendChild(style);
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
  