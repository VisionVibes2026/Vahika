require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, initDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Initialize database
initDb();

// Development simulator
let simulatorInterval;
app.post('/api/simulate', (req, res) => {
  const { enable } = req.body;
  if (enable) {
    if (!simulatorInterval) {
      simulatorInterval = setInterval(() => {
        const now = new Date().toISOString();
        const temp = 7.0 + (Math.random() - 0.5) * 1.5;
        const hum = 76.0 + (Math.random() - 0.5) * 3.0;
        const gas = 4.5 + (Math.random() - 0.5) * 1.0;
        const mot = 0.6 + (Math.random() - 0.5) * 0.2;
        const bat = Math.max(10, 84 - Math.floor(Math.random() * 2));
        
        db.run(`INSERT INTO SensorReading (deviceId, shipmentId, timestamp, temperature, humidity, gasVoc, latitude, longitude, motion, vibration, batteryLevel)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          ['VHK-NODE-032', 'SHP-1001', now, temp, hum, gas, 11.0168, 76.9558, mot, 0.1, bat]);
      }, 5000);
    }
    res.json({ message: 'Simulation started' });
  } else {
    if (simulatorInterval) {
      clearInterval(simulatorInterval);
      simulatorInterval = null;
    }
    res.json({ message: 'Simulation stopped' });
  }
});

// Telemetry ingestion endpoint
app.post('/api/telemetry', (req, res) => {
  const { deviceId, shipmentId, temperature, humidity, gasVoc, latitude, longitude, motion, timestamp } = req.body;
  const ts = timestamp || new Date().toISOString();
  
  db.run(`INSERT INTO SensorReading (deviceId, shipmentId, timestamp, temperature, humidity, gasVoc, latitude, longitude, motion, vibration, batteryLevel)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [deviceId, shipmentId, ts, temperature, humidity, gasVoc, latitude, longitude, motion, 0.1, 84], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, id: this.lastID });
    });
});

// Get recent telemetry
app.get('/api/telemetry/recent', (req, res) => {
  const deviceId = req.query.deviceId || 'VHK-NODE-032';
  db.all(`SELECT * FROM SensorReading WHERE deviceId = ? ORDER BY id DESC LIMIT 20`, [deviceId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Return in chronological order
    res.json(rows.reverse());
  });
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Fallback to index.html for SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`VAHIKA backend listening on port ${PORT}`);
});
