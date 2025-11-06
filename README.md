# Real-Time Stock Market WebSocket Application

A real-time stock market monitoring application demonstrating WebSocket programming and multiplexing concepts using Node.js and Socket.io.

## Team Members

- **Cosmas Kiprotich Karonei** - ckiprotich@usiu.ac.ke
- **Dushime Didier Serge** - ddserge@usiu.ac.ke
- **Benhin Mwendwa** - benhinmwendwa@gmail.com

**United States International University-Africa**  
School of Science and Technology  
Socket Programming Assignment - 2025

---

## Project Overview

This application demonstrates advanced socket programming concepts including real-time bidirectional communication, WebSocket multiplexing, and asynchronous event-driven architecture. Users can connect to a WebSocket server, subscribe to specific stock symbols, and receive live price updates.

### Key Features

- **Real-time WebSocket Communication** - Instant data updates using Socket.io
- **Multiplexing** - Single connection handles multiple stock subscriptions
- **Multiple Concurrent Clients** - Server supports unlimited simultaneous connections
- **Bidirectional Messaging** - Client and server communicate both ways
- **Live Price Simulation** - Dynamic stock price updates with percentage changes
- **Subscription Management** - Subscribe/unsubscribe to specific stocks
- **Activity Logging** - Real-time event tracking and display
- **Responsive Design** - Works on desktop and mobile devices

---

## Technologies Used

- **Backend:**
  - Node.js - JavaScript runtime environment
  - Express.js - Web application framework
  - Socket.io - Real-time bidirectional communication library

- **Frontend:**
  - HTML5 - Structure and markup
  - CSS3 - Styling and responsive design
  - JavaScript (Vanilla) - Client-side logic
  - Socket.io Client - WebSocket connection management

---

## Multiplexing Implementation

### What is Multiplexing?

Multiplexing allows multiple data streams (stock symbols) to be transmitted over a single WebSocket connection. Instead of creating separate connections for each stock, our implementation uses one connection per client but can handle multiple subscriptions efficiently.

### How It Works

```
Server maintains: Map<socketId, Set<stockSymbols>>

Client 1 connects → subscribes to [AAPL, GOOGL]
Client 2 connects → subscribes to [TSLA, NVDA]
Client 3 connects → subscribes to [AAPL, MSFT, AMZN]

Server broadcasts updates:
- Only AAPL & GOOGL prices sent to Client 1
- Only TSLA & NVDA prices sent to Client 2
- Only AAPL, MSFT & AMZN prices sent to Client 3
```

### Benefits

- **Bandwidth Efficiency** - Only subscribed data is transmitted
- **Scalability** - Single connection handles multiple data streams
- **Flexibility** - Dynamic subscription management
- **Performance** - Reduced server load and connection overhead

---

## Installation & Setup

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (Node Package Manager)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/stock-market-websocket.git
   cd stock-market-websocket
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   Navigate to: http://localhost:3000
   ```

### Development Mode

For automatic server restart on file changes:
```bash
npm run dev
```

---

## Project Structure

```
stock-market-app/
├── server.js              # Main WebSocket server
├── package.json          # Project dependencies and scripts
├── public/               # Client-side files
│   ├── index.html       # Main web interface
│   ├── css/
│   │   └── style.css    # Application styling
│   └── js/
│       └── client.js    # WebSocket client logic
└── README.md            # This file
```

---

## How to Use

### Basic Usage

1. **Connect to Server** - Application automatically connects on page load
2. **Subscribe to Stocks** - Click on stock symbol buttons to subscribe
3. **Watch Live Updates** - Subscribed stocks update in real-time
4. **View Activity Log** - Monitor all WebSocket events
5. **Market Summary** - Click "View Market Summary" for top gainers/losers

### Testing Multiplexing

1. Open the application in multiple browser tabs
2. Subscribe to different stocks in each tab
3. Check "Connected Clients" counter
4. Open browser DevTools → Network → WS tab
5. Observe single WebSocket connection per client
6. Each client receives only their subscribed data

---

## WebSocket Events

### Client → Server

- `subscribe` - Subscribe to stock symbol(s)
- `unsubscribe` - Unsubscribe from stock symbol(s)
- `request-summary` - Request market summary
- `client-message` - Send custom message

### Server → Client

- `initial-data` - Send all stock data on connection
- `stock-update` - Real-time price updates (multiplexed)
- `subscription-update` - Confirm subscription changes
- `client-stats` - Broadcast connection statistics
- `market-summary` - Market analysis response
- `server-response` - Generic server response

---

## Key Concepts Demonstrated

### 1. Asynchronous Programming
- Node.js event loop handling multiple operations
- Non-blocking I/O for concurrent client connections
- Promise-based async patterns

### 2. WebSocket Protocol
- Full-duplex communication channels
- Persistent connection management
- Real-time bidirectional data flow

### 3. Event-Driven Architecture
- Event emitters and listeners
- Callback-based messaging
- Loose coupling between components

### 4. Multiplexing
- Single connection for multiple data streams
- Per-client subscription tracking
- Selective data broadcasting

---

## Testing

### Manual Testing

1. **Single Client Test**
   - Open application
   - Subscribe to stocks
   - Verify real-time updates

2. **Multi-Client Test**
   - Open 3+ browser tabs
   - Subscribe to different stocks per tab
   - Verify isolated data streams

3. **Network Test**
   - Open DevTools → Network → WS
   - Verify single WebSocket connection
   - Monitor message traffic

### Server Console Output

```bash
====================================================
Stock Market WebSocket Server Started
====================================================
Server running at: http://localhost:3000
WebSocket endpoint: ws://localhost:3000
Tracking 8 stock symbols
====================================================

Client connected: abc123 | Total clients: 1
Client abc123 subscribed to AAPL
Client abc123 subscribed to GOOGL
```

---

##  Academic Context

This project fulfills the requirements for socket programming assignment including:

- WebSocket server implementation using Node.js
- Client application with real-time UI updates
- Bidirectional communication demonstration
- Multiplexing implementation and documentation
- Web interface with professional UI/UX
- Comprehensive technical documentation

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Use different port
PORT=3001 npm start
```

### Dependencies Not Installing

```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### WebSocket Not Connecting

- Ensure server is running
- Check firewall settings
- Access via `http://localhost:3000` (not `file://`)
- Check browser console for errors

---

## Documentation

- **Socket.io:** https://socket.io/docs/
- **Node.js:** https://nodejs.org/en/docs/
- **Express.js:** https://expressjs.com/
- **WebSocket RFC:** https://tools.ietf.org/html/rfc6455

---

## 📄 License

This project is created for academic purposes at United States International University-Africa.

---

## Contributing

This is an academic project. For questions or suggestions, contact any team member listed above.

---

##  Acknowledgments

- United States International University-Africa
- School of Science and Technology
- Course Instructor

---

**Note:** Stock prices in this application are randomly generated for demonstration purposes only. This is an educational project and should not be used for actual trading decisions.

---

##  Contact

For questions about this project, please contact:

- **Cosmas Kiprotich Karonei** - ckiprotich@usiu.ac.ke
- **Dushime Didier Serge** - ddserge@usiu.ac.ke
- **Benhin Mwendwa** - benhinmwendwa@gmail.com

**University:** United States International University-Africa  
**Department:** School of Science and Technology  
**Year:** 2025
