# VAHIKA

An affordable IoT platform for farm-to-fork food traceability.

## Overview
VAHIKA is an enterprise-grade dashboard designed for cold-chain shipment monitoring and food traceability. It provides real-time monitoring of temperature, humidity, gas/VOC, motion, and battery levels for shipments, ensuring data integrity across the supply chain journey.

## Key Features
- **Real-Time Telemetry:** Live sensor data visualization for shipments.
- **Traceability:** Chronological supply chain journey tracking (Farm -> Transit -> Warehouse -> Retailer).
- **Data Integrity:** Verification records and offline storage mechanisms.
- **REST APIs:** Full integration with backend database for data ingestion and retrieval.
- **Development Simulator:** Built-in simulation mode to generate telemetry without physical hardware.

## Architecture
- **Frontend:** HTML, CSS, Vanilla JS, Leaflet.js
- **Backend:** Node.js, Express.js
- **Database:** SQLite3

## Project Structure
- `index.html` - The main dashboard interface.
- `leaflet.js`, `leaflet.css` - Map rendering libraries.
- `server.js` - Express backend server and REST APIs.
- `database.js` - SQLite schema initialization and data seeding.
- `package.json` - Node dependencies.
- `vahika.db` - Auto-generated SQLite database file.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

### Running Backend & Frontend
Start the application (this will initialize the database and serve the frontend on port 8080):
```bash
npm start
```
Open your browser and navigate to: `http://localhost:8080`

## Development Data Simulator
To run the dashboard without physical IoT hardware, a development simulator is included.
The frontend automatically triggers the simulator upon load via the `/api/simulate` endpoint.
This will generate random, realistic telemetry readings every 5 seconds.
*Note: A badge will appear in the bottom right corner when the simulation is active.*

## API Overview
- `POST /api/telemetry` - Ingest real hardware data. Payload expects: `deviceId`, `shipmentId`, `temperature`, `humidity`, `gasVoc`, `latitude`, `longitude`, `motion`, `timestamp`.
- `GET /api/telemetry/recent` - Retrieve the latest telemetry data for rendering in the dashboard.
- `POST /api/simulate` - Enable or disable the development data simulator.

## Security
- No secrets are hardcoded in the repository. Use environment variables.
- Configured with basic CORS.
- Validates basic constraints on the database level via schema definitions.

## Future Improvements
- Implement JWT based Authentication.
- Integrate a live blockchain network for verification (currently simulated status).
- Deploy on scalable infrastructure with PostgreSQL.
