const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'vahika.db');
const db = new sqlite3.Database(dbPath);

function initDb() {
  db.serialize(() => {
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON");

    // Devices
    db.run(`CREATE TABLE IF NOT EXISTS Device (
      id TEXT PRIMARY KEY,
      deviceCode TEXT UNIQUE,
      status TEXT,
      batteryLevel INTEGER,
      lastSeen TEXT,
      firmwareVersion TEXT,
      location TEXT
    )`);

    // Shipments
    db.run(`CREATE TABLE IF NOT EXISTS Shipment (
      id TEXT PRIMARY KEY,
      shipmentCode TEXT UNIQUE,
      productName TEXT,
      origin TEXT,
      destination TEXT,
      status TEXT,
      startTime TEXT,
      estimatedArrival TEXT,
      deviceId TEXT,
      FOREIGN KEY (deviceId) REFERENCES Device(id)
    )`);

    // SensorReadings
    db.run(`CREATE TABLE IF NOT EXISTS SensorReading (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deviceId TEXT,
      shipmentId TEXT,
      timestamp TEXT,
      temperature REAL,
      humidity REAL,
      gasVoc REAL,
      latitude REAL,
      longitude REAL,
      motion REAL,
      vibration REAL,
      batteryLevel INTEGER,
      FOREIGN KEY (deviceId) REFERENCES Device(id),
      FOREIGN KEY (shipmentId) REFERENCES Shipment(id)
    )`);

    // Alerts
    db.run(`CREATE TABLE IF NOT EXISTS Alert (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipmentId TEXT,
      deviceId TEXT,
      type TEXT,
      severity TEXT,
      message TEXT,
      timestamp TEXT,
      status TEXT,
      FOREIGN KEY (deviceId) REFERENCES Device(id),
      FOREIGN KEY (shipmentId) REFERENCES Shipment(id)
    )`);

    // TraceEvents
    db.run(`CREATE TABLE IF NOT EXISTS TraceEvent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipmentId TEXT,
      eventType TEXT,
      location TEXT,
      timestamp TEXT,
      actor TEXT,
      verificationStatus TEXT,
      FOREIGN KEY (shipmentId) REFERENCES Shipment(id)
    )`);

    // RiskAssessments
    db.run(`CREATE TABLE IF NOT EXISTS RiskAssessment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipmentId TEXT,
      riskScore INTEGER,
      riskLevel TEXT,
      reason TEXT,
      timestamp TEXT,
      FOREIGN KEY (shipmentId) REFERENCES Shipment(id)
    )`);

    // Seed Data if empty
    db.get("SELECT COUNT(*) as count FROM Device", (err, row) => {
      if (row && row.count === 0) {
        console.log("Seeding initial data...");
        const now = new Date().toISOString();
        
        // Seed Device
        db.run(`INSERT INTO Device (id, deviceCode, status, batteryLevel, lastSeen, firmwareVersion, location)
                VALUES ('VHK-NODE-032', 'VHK-NODE-032', 'ONLINE', 84, '${now}', '1.2.4', 'Coimbatore')`);
        
        // Seed Shipment
        db.run(`INSERT INTO Shipment (id, shipmentCode, productName, origin, destination, status, startTime, estimatedArrival, deviceId)
                VALUES ('SHP-1001', 'SHP-1001', 'Organic Apples', 'Erode, TN', 'Chennai, TN', 'IN_TRANSIT', '${now}', '2026-10-10T18:00:00Z', 'VHK-NODE-032')`);
        
        // Seed Trace Events
        db.run(`INSERT INTO TraceEvent (shipmentId, eventType, location, timestamp, actor, verificationStatus)
                VALUES ('SHP-1001', 'FARM_DISPATCH', 'Erode, TN', '${now}', 'Farm Node 1', 'VERIFIED')`);
        
        console.log("Seed data completed.");
      }
    });
  });
}

module.exports = {
  db,
  initDb
};
