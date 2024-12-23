Module.register("MMM-RocketAlerts", {
    defaults: {
        alertUrl: "https://www.oref.org.il/WarningMessages/alert/alerts.json",
        historyUrl: "https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json",
        alertUpdateInterval: 1000, // 1 second
        historyUpdateInterval: 10 * 1000, // 10 seconds
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

                const alertDate = new Date(alert.alertDate);
                const now = new Date();
                const isToday = alertDate.toDateString() === now.toDateString();

                const options = isToday
                ? { hour: '2-digit', minute: '2-digit', hour12: true }
                : { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: true };
        
            const formattedDate = alertDate.toLocaleTimeString('en-US', options);

                historyItem.innerHTML = `${formattedDate} : ${alert.title} - ${alert.data}`;
                historyList.appendChild(historyItem);
            });
            wrapper.appendChild(historyList);
        } else {
            const noHistory = document.createElement("div");
            noHistory.className = "no-history";
            noHistory.innerHTML = "No Recent Alerts.";
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
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            // Filter alerts from the past week
            const recentAlerts = payload.filter(alert => {
                const alertDate = new Date(alert.alertDate);
                return alertDate >= oneWeekAgo;
            });
            const newAlerts = recentAlerts.slice(0, 5);

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
