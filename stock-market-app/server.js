/**
 * Stock Market WebSocket Server
 * 
 * Group Members:
 * - Cosmas Kiprotich Karonei (ckiprotich@usiu.ac.ke)
 * - Dushime Didier Serge (ddserge@usiu.ac.ke)
 * - Benhin Mwendwa (benhinmwendwa@gmail.com)
 * 
 * United States International University-Africa
 * Socket Programming Assignment
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Stock symbols with initial data
// Note: In a real app, this would come from a stock market API
const stockSymbols = {
  'AAPL': { name: 'Apple Inc.', price: 178.50, change: 0 },
  'GOOGL': { name: 'Alphabet Inc.', price: 142.30, change: 0 },
  'MSFT': { name: 'Microsoft Corp.', price: 378.91, change: 0 },
  'AMZN': { name: 'Amazon.com Inc.', price: 145.67, change: 0 },
  'TSLA': { name: 'Tesla Inc.', price: 242.84, change: 0 },
  'META': { name: 'Meta Platforms', price: 312.45, change: 0 },
  'NVDA': { name: 'NVIDIA Corp.', price: 495.22, change: 0 },
  'NFLX': { name: 'Netflix Inc.', price: 489.33, change: 0 }
};

// Store active subscriptions for multiplexing
const activeSubscriptions = new Map(); // socketId -> Set of symbols
let connectedClients = 0;

/**
 * MULTIPLEXING IMPLEMENTATION:
 * This is the core of our multiplexing system. Each client maintains their own
 * set of subscribed stocks, and we only send them updates for stocks they've
 * subscribed to. This saves bandwidth compared to sending all stock data to everyone.
 */


const priceHistory = {};
Object.keys(stockSymbols).forEach(symbol => {
    priceHistory[symbol] = [stockSymbols[symbol].price];
});
// Simulate real-time stock price changes
function updateStockPrices() {
  Object.keys(stockSymbols).forEach(symbol => {
    const stock = stockSymbols[symbol];
    const previousPrice = stock.price;
    
    // Random price change between -2% and +2%
    const changePercent = (Math.random() - 0.5) * 0.04;
    const newPrice = stock.price * (1 + changePercent);
    
    stock.price = parseFloat(newPrice.toFixed(2));
    stock.change = parseFloat(((stock.price - previousPrice) / previousPrice * 100).toFixed(2));

        if (!priceHistory[symbol]) {
      priceHistory[symbol] = [];
    }
    priceHistory[symbol].push(stock.price);
    
    // Keep only last 20 prices
    if (priceHistory[symbol].length > 20) {
      priceHistory[symbol].shift();
    }
  });
};

// Broadcast stock updates to subscribed clients
function broadcastStockUpdates() {
  // Go through all connected clients
  activeSubscriptions.forEach((subscribedSymbols, socketId) => {
    const socket = io.sockets.sockets.get(socketId);
    
    if (socket && subscribedSymbols.size > 0) {
      // Only send data for stocks this client subscribed to
      const updates = {};
      subscribedSymbols.forEach(symbol => {
        if (stockSymbols[symbol]) {
          updates[symbol] = stockSymbols[symbol];
        }
      });
      
      // Send through WebSocket
      socket.emit('stock-update', updates);
    }
  });
}

// WebSocket connection handling
io.on('connection', (socket) => {
  connectedClients++;
  console.log(`Client connected: ${socket.id} | Total clients: ${connectedClients}`);
  
  // Initialize subscription set for this client (multiplexing setup)
  activeSubscriptions.set(socket.id, new Set());
  
  // Send initial stock data
  socket.emit('initial-data', {
    stocks: stockSymbols,
    timestamp: new Date().toISOString()
  });
  
  // Broadcast connection stats to all clients
  io.emit('client-stats', {
    connectedClients: connectedClients,
    totalSubscriptions: Array.from(activeSubscriptions.values())
      .reduce((sum, set) => sum + set.size, 0)
  });
  
  // Handle stock subscription (multiplexing: multiple symbols per connection)
  socket.on('subscribe', (symbols) => {
    if (!Array.isArray(symbols)) {
      symbols = [symbols];
    }
    
    const clientSubscriptions = activeSubscriptions.get(socket.id);
    symbols.forEach(symbol => {
      if (stockSymbols[symbol]) {
        clientSubscriptions.add(symbol);
        console.log(`Client ${socket.id} subscribed to ${symbol}`);
      }
    });
    
    // Send confirmation with current subscriptions
    socket.emit('subscription-update', {
      subscribed: Array.from(clientSubscriptions),
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle unsubscribe (multiplexing: selective data flow control)
  socket.on('unsubscribe', (symbols) => {
    if (!Array.isArray(symbols)) {
      symbols = [symbols];
    }
    
    const clientSubscriptions = activeSubscriptions.get(socket.id);
    symbols.forEach(symbol => {
      clientSubscriptions.delete(symbol);
      console.log(`Client ${socket.id} unsubscribed from ${symbol}`);
    });
    
    socket.emit('subscription-update', {
      subscribed: Array.from(clientSubscriptions),
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle client requesting market summary
  socket.on('request-summary', () => {
    const summary = {
      totalStocks: Object.keys(stockSymbols).length,
      gainers: [],
      losers: []
    };
    
    Object.entries(stockSymbols).forEach(([symbol, data]) => {
      if (data.change > 0) {
        summary.gainers.push({ symbol, ...data });
      } else if (data.change < 0) {
        summary.losers.push({ symbol, ...data });
      }
    });
    
    summary.gainers.sort((a, b) => b.change - a.change);
    summary.losers.sort((a, b) => a.change - b.change);
    
    socket.emit('market-summary', summary);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    connectedClients--;
    activeSubscriptions.delete(socket.id);
    console.log(`Client disconnected: ${socket.id} | Total clients: ${connectedClients}`);
    
    io.emit('client-stats', {
      connectedClients: connectedClients,
      totalSubscriptions: Array.from(activeSubscriptions.values())
        .reduce((sum, set) => sum + set.size, 0)
    });
  });
  
  // Handle custom client message
  socket.on('client-message', (data) => {
    console.log(`Message from ${socket.id}:`, data);
    socket.emit('server-response', {
      message: 'Message received',
      echo: data,
      timestamp: new Date().toISOString()
    });
  });
});

// Update prices every 2 seconds
// We chose 2 seconds to make it realistic without overwhelming the server
setInterval(() => {
  updateStockPrices();
}, 2000);

// Broadcast updates every 1 second
// Faster than price updates so clients see changes quickly
setInterval(() => {
  broadcastStockUpdates();
}, 1000);

// Start server
server.listen(PORT, () => {
  console.log('====================================================');
  console.log('Stock Market WebSocket Server Started');
  console.log('====================================================');
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`Tracking ${Object.keys(stockSymbols).length} stock symbols`);
  console.log('====================================================');
  console.log('\nMultiplexing Features:');
  console.log('- Multiple clients can connect at once');
  console.log('- Each client subscribes to different stocks');
  console.log('- Single connection handles multiple data streams');
  console.log('- Only subscribed data is sent to each client');
  console.log('====================================================\n');
});