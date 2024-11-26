const Log = require("logger");
Module.register("MMM-RocketAlerts", {
    defaults: {
      updateInterval: 1000, // 1 second for new alerts
      historyInterval: 5000, // 5 seconds for history updates
      newAlertsApiUrl: "https://www.oref.org.il/WarningMessages/alert/alerts.json", // API for new alerts
      historyApiUrl: "https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json", // API for alert history
    },
  
    start: function () {
      this.alerts = []; // Initialize empty alerts array
      this.getNewAlerts(); // Start checking new alerts
      this.getHistoryAlerts(); // Fetch history alerts
      this.scheduleUpdates(); // Schedule periodic updates
    },
  
    async fetchJson(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        Log.error(`MMM-RocketAlerts: Error fetching data from ${url}`, error);
        return null;
      }
    },
  
    async getNewAlerts() {
      const response = await this.fetchJson(this.config.newAlertsApiUrl);
      if (response) {
        this.processNewAlerts(response);
      }
    },
  
    async getHistoryAlerts() {
      const response = await this.fetchJson(this.config.historyApiUrl);
      if (response) {
        this.processHistoryAlerts(response);
      }
    },
  
    processNewAlerts(response) {
      // Ensure response structure matches the expected format
      if (response && response.id) {
        const isNewAlert = !this.alerts.find((existingAlert) => existingAlert.id === response.id);
  
        if (isNewAlert) {
          this.alerts.push(response); // Add the new alert to the list
          this.trimAlerts(); // Keep only the latest 5 alerts
          this.updateDom(); // Update the DOM
        }
      }
    },
  
    processHistoryAlerts(response) {
      if (Array.isArray(response) && response.length > 0) {
        response.forEach((alert) => {
          const isNewAlert = !this.alerts.find((existingAlert) => existingAlert.id === alert.id);
  
          if (isNewAlert) {
            this.alerts.push(alert); // Add historical alert to the list
          }
        });
        this.trimAlerts(); // Keep only the latest 5 alerts
        this.updateDom(); // Update the DOM with the latest alerts
      } else {
        Log.log(`response from rocket history: ${JSON.stringify(response)}`)
      }
    },
  
    trimAlerts() {
      // Sort alerts by ID descending (assuming newer IDs are larger) and keep only the latest 5
      this.alerts = this.alerts.sort((a, b) => b.id - a.id).slice(0, 5);
    },
  
    scheduleUpdates() {
      // Check new alerts every second
      setInterval(() => {
        this.getNewAlerts();
      }, this.config.updateInterval);
  
      // Check history every 5 seconds
      setInterval(() => {
        this.getHistoryAlerts();
      }, this.config.historyInterval);
    },
  
    getDom() {
      const wrapper = document.createElement("div");
      wrapper.className = "rocket-alerts";
  
      if (this.alerts.length === 0) {
        wrapper.innerHTML = "No alerts.";
        return wrapper;
      }
  
      const title = document.createElement("h2");
      title.innerText = "Rocket Alerts";
      wrapper.appendChild(title);
  
      // Alerts Section
      const alertsSection = document.createElement("div");
      alertsSection.className = "alerts-section";
  
      this.alerts.forEach((alert) => {
        const alertDiv = document.createElement("div");
        alertDiv.className = "alert";
  
        const id = document.createElement("div");
        id.innerText = `ID: ${alert.id}`;
        alertDiv.appendChild(id);
  
        const title = document.createElement("div");
        title.innerText = `Title: ${alert.title}`;
        alertDiv.appendChild(title);
  
        const data = document.createElement("div");
        data.innerText = `Location: ${alert.data.join(", ")}`;
        alertDiv.appendChild(data);
  
        const desc = document.createElement("div");
        desc.innerText = `Description: ${alert.desc}`;
        alertDiv.appendChild(desc);
  
        alertsSection.appendChild(alertDiv);
      });
  
      wrapper.appendChild(alertsSection);
  
      return wrapper;
    },
  });
  