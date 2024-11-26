# MMM-RocketAlerts

This is a module for [MagicMirror²](https://magicmirror.builders/) that displays rocket alerts in Israel, sourced from an external API. When a siren is detected, the screen flashes red to alert users.

---

## Installation

1. Navigate to your MagicMirror `modules` directory:
   ```bash
   cd ~/MagicMirror/modules
   ```

2. Clone this repository
```bash
 git clone https://github.com/YourUsername/MMM-RocketAlerts.git
```

3. Navigate to the module directory:
 ```bash
   cd MMM-RocketAlerts
```
4.Install the required dependencies:
```bash
npm install
```
---
## Configuration
Add the module to the modules array in your config.js file:
```javascript
{
  module: "MMM-RocketAlerts",
  position: "middle_center", // You can change the position as needed
  config: {
    updateInterval: 60000, // Update interval in milliseconds (default: 1 minute)
    apiUrl: "https://www.oref.org.il/WarningMessages/alert/alerts.json", // API URL for alerts
  },
},
```
## Configuration Options

| Option | Description | Default Value|
| --- | --- | --- |
| `updateInterval` | How often the module fetches new alerts (in milliseconds). | `60000` (1 minute)|
| `apiurl` | The URL of the API that provides alert dat | OREF API URL (see example)|
---
## Features
- Fetches real-time rocket alerts.
- Displays alert details, including affected cities and their "migun" (shelter) time.
- Flashes the entire screen red during an active siren.

