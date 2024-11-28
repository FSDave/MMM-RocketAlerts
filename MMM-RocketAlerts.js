Module.register("MMM-RocketAlerts", {
    defaults: {
        alertUrl: "https://www.oref.org.il/WarningMessages/alert/alerts.json",
        historyUrl: "https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json",
        alertUpdateInterval: 1000, // 1 second
        historyUpdateInterval: 5 * 1000, // 5 seconds
    },

    start: function () {
        this.lastAlerts = [];
        this.currentAlert = null;
        this.sendSocketNotification("START_FETCH", this.config);
        this.updateDom();
    },

    getStyles: function () {
        return ["MMM-RocketAlerts.css"];
    },

    getDom: function () {
        const wrapper = document.createElement("div");

        // Display the current alert
        if (this.currentAlert) {
            const alertTitle = document.createElement("div");
            alertTitle.className = "alert-title";
            alertTitle.innerHTML = `<strong>${this.currentAlert.title}</strong>: ${this.currentAlert.data.join(", ")}`;
            wrapper.appendChild(alertTitle);

            const alertDesc = document.createElement("div");
            alertDesc.className = "alert-desc";
            alertDesc.innerHTML = this.currentAlert.desc;
            wrapper.appendChild(alertDesc);
            
        }
        else if (this.lastAlerts.length > 0) {
            const historyHeader = document.createElement("div");
            historyHeader.className = "history-header";
            historyHeader.innerHTML = "Last 5 Alerts:";
            wrapper.appendChild(historyHeader);

            const historyList = document.createElement("ul");
            historyList.className = "history-list";
            this.lastAlerts.forEach(alert => {
                const historyItem = document.createElement("li");
                historyItem.innerHTML = `${alert.alertDate}: ${alert.title} - ${alert.data}`;
                historyList.appendChild(historyItem);
            });
            wrapper.appendChild(historyList);
        } else {
            const noHistory = document.createElement("div");
            noHistory.className = "no-history";
            noHistory.innerHTML = "No recent alerts.";
            wrapper.appendChild(noHistory);
        }

        return wrapper;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "ALERT_RECEIVED") {
                this.currentAlert = payload;
                this.flashScreenRed();
                this.updateDom();
        } else if (notification === "HISTORY_RECEIVED") {
            const newAlerts = payload.slice(0, 5);

            // Check if there are new alerts
            const isNewAlerts = JSON.stringify(this.lastAlerts) !== JSON.stringify(newAlerts);

            if (isNewAlerts) {
                this.lastAlerts = newAlerts;
                this.updateDom();
            }
        }
    },

    flashScreenRed: function () {
        const body = document.querySelector("body");
        body.classList.add("flash-red");
        setTimeout(() => {
            this.currentAlert = null;
            body.classList.remove("flash-red");
            this.updateDom();
        }, 5000);
    },
});
