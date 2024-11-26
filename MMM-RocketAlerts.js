Module.register("MMM-RocketAlerts", {
    defaults: {
      updateInterval: 1000, // 1 second for new alerts
      historyInterval: 5000, // 5 seconds for history updates
      newAlertsApiUrl: "https://www.oref.org.il/WarningMessages/alert/alerts.json", // API for new alerts
      historyApiUrl: "https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json", // API for alert history
    },
  
    start: function () {
      this.alerts = []; // Initialize empty alerts array
      this.historyAlerts = []; // Initialize empty history alerts array
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
        // Assuming response contains an array of alerts
        const latestAlert = response[0];
        const isNewAlert = !this.alerts.find((alert) => alert.alertDate === latestAlert.alertDate);
  
        if (isNewAlert) {
          this.alerts.unshift(latestAlert); // Add new alert to the top of the list
          this.updateDom(); // Update the DOM
        }
      }
    },
  
    processHistoryAlerts: function (response) {
      // Sort history by date descending and take the last 5 alerts
      this.historyAlerts = response
        .sort((a, b) => new Date(b.alertDate) - new Date(a.alertDate))
        .slice(0, 5);
  
      this.updateDom(); // Update the DOM with the latest history alerts
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
  
      if (this.alerts.length === 0 && this.historyAlerts.length === 0) {
        wrapper.innerHTML = "No alerts.";
        return wrapper;
      }
  
      const title = document.createElement("h2");
      title.innerText = "Rocket Alerts";
      wrapper.appendChild(title);
  
      // New Alerts Section
      const newAlertsSection = document.createElement("div");
      newAlertsSection.className = "new-alerts";
  
      const newAlertsTitle = document.createElement("h3");
      newAlertsTitle.innerText = "New Alerts:";
      newAlertsSection.appendChild(newAlertsTitle);
  
      if (this.alerts.length === 0) {
        const noNewAlerts = document.createElement("div");
        noNewAlerts.innerText = "No new alerts.";
        newAlertsSection.appendChild(noNewAlerts);
      } else {
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
  
          newAlertsSection.appendChild(alertDiv);
        });
      }
  
      wrapper.appendChild(newAlertsSection);
  
      // History Section
      const historySection = document.createElement("div");
      historySection.className = "history-alerts";
  
      const historyTitle = document.createElement("h3");
      historyTitle.innerText = "Alert History (Last 5):";
      historySection.appendChild(historyTitle);
  
      if (this.historyAlerts.length === 0) {
        const noHistory = document.createElement("div");
        noHistory.innerText = "No history alerts.";
        historySection.appendChild(noHistory);
      } else {
        this.historyAlerts.forEach((alert) => {
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
  
          historySection.appendChild(alertDiv);
        });
      }
  
      wrapper.appendChild(historySection);
  
      return wrapper;
    },
  });
  