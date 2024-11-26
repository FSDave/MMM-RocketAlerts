Module.register("MMM-RocketAlerts", {
    defaults: {
        updateInterval: 1000, // Fetch new data every second
    },

    start() {
        this.currentAlert = null;
        this.alertHistory = [];
        this.isFlashing = false;
        this.sendSocketNotification("INIT", this.config);
    },

    getStyles() {
        return ["MMM-RocketAlerts.css"];
    },

    getDom() {
        const wrapper = document.createElement("div");

        // Display current alert if available
        if (this.currentAlert) {
            const alertDiv = document.createElement("div");
            alertDiv.className = "alert";
            alertDiv.innerHTML = `
                <h2>${this.currentAlert.title}</h2>
                <p>${this.currentAlert.desc}</p>
                <p>Location(s): ${this.currentAlert.data.join(", ")}</p>
            `;
            wrapper.appendChild(alertDiv);
        }

        // Display alert history
        if (this.alertHistory.length > 0) {
            const historyDiv = document.createElement("div");
            historyDiv.className = "history";

            const historyTitle = document.createElement("h3");
            historyTitle.textContent = "Last 5 Alerts:";
            historyDiv.appendChild(historyTitle);

            this.alertHistory.forEach((alert) => {
                const alertEntry = document.createElement("p");
                alertEntry.innerHTML = `
                    <strong>${alert.alertDate}</strong> - ${alert.title} (${alert.data})
                `;
                historyDiv.appendChild(alertEntry);
            });

            wrapper.appendChild(historyDiv);
        }

        return wrapper;
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "CURRENT_ALERT") {
            this.handleAlert(payload);
        } else if (notification === "ALERT_HISTORY") {
            this.alertHistory = payload;
            this.updateDom();
        }
    },

    handleAlert(data) {
        if (Object.keys(data).length > 0 && !this.isFlashing) {
            // Flash screen red for 5 seconds
            this.isFlashing = true;
            this.currentAlert = data;
            this.updateDom();

            document.body.classList.add("flash-red");
            setTimeout(() => {
                document.body.classList.remove("flash-red");
                this.isFlashing = false;
            }, 5000);
        } else if (Object.keys(data).length === 0) {
            this.currentAlert = null;
            this.updateDom();
        }
    },
});
