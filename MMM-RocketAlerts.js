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
  
    getNewAlerts: function () {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", this.config.newAlertsApiUrl, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            this.processNewAlerts(response);
          } catch (error) {
            console.error("MMM-RocketAlerts: Error parsing new alerts response:", error);
          }
        }
      };
      xhr.send();
    },
  
    getHistoryAlerts: function () {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", this.config.historyApiUrl, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            this.processHistoryAlerts(response);
          } catch (error) {
            console.error("MMM-RocketAlerts: Error parsing history alerts response:", error);
          }
        }
      };
      xhr.send();
    },
  
    processNewAlerts: function (response) {
      if (response && response.length > 0) {
        response.forEach((alert) => {
          const isNewAlert = !this.alerts.find(
            (existingAlert) => existingAlert.alertDate === alert.alertDate
          );
  
          if (isNewAlert) {
            this.alerts.push(alert); // Add the new alert to the list
          }
        });
        this.trimAlerts(); // Keep only the latest 5 alerts
        this.updateDom(); // Update the DOM
      }
    },
  
    processHistoryAlerts: function (response) {
      if (response && response.length > 0) {
        response.forEach((alert) => {
          const isNewAlert = !this.alerts.find(
            (existingAlert) => existingAlert.alertDate === alert.alertDate
          );
  
          if (isNewAlert) {
            this.alerts.push(alert); // Add historical alert to the list
          }
        });
        this.trimAlerts(); // Keep only the latest 5 alerts
        this.updateDom(); // Update the DOM with the latest alerts
      }
    },
  
    trimAlerts: function () {
      // Sort alerts by date descending and keep only the latest 5
      this.alerts = this.alerts
        .sort((a, b) => new Date(b.alertDate) - new Date(a.alertDate))
        .slice(0, 5);
    },
  
    scheduleUpdates: function () {
      // Check new alerts every second
      setInterval(() => {
        this.getNewAlerts();
      }, this.config.updateInterval);
  
      // Check history every 5 seconds
      setInterval(() => {
        this.getHistoryAlerts();
      }, this.config.historyInterval);
    },
  
    getDom: function () {
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
  
        const date = document.createElement("div");
        date.innerText = `Date: ${alert.alertDate}`;
        alertDiv.appendChild(date);
  
        const title = document.createElement("div");
        title.innerText = `Title: ${alert.title}`;
        alertDiv.appendChild(title);
  
        const data = document.createElement("div");
        data.innerText = `Location: ${alert.data}`;
        alertDiv.appendChild(data);
  
        alertsSection.appendChild(alertDiv);
      });
  
      wrapper.appendChild(alertsSection);
  
      return wrapper;
    },
  });
  