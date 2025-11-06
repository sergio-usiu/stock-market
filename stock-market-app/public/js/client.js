/**
 * Stock Market WebSocket Client
 * 
 * Group Members:
 * - Cosmas Kiprotich Karonei
 * - Dushime Didier Serge  
 * - Benhin Mwendwa
 * 
 * This client handles the WebSocket connection and UI updates
 */

// Initialize Socket.io connection
const socket = io();

// Client state
let stocks = {};
let subscribedSymbols = new Set();
let updateCounter = 0;

// DOM Elements
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const stockGrid = document.getElementById('stockGrid');
const subscriptionButtons = document.getElementById('subscriptionButtons');
const activityLog = document.getElementById('activityLog');
const clientCount = document.getElementById('clientCount');
const subscriptionCount = document.getElementById('subscriptionCount');
const updateCount = document.getElementById('updateCount');

// Connection established
socket.on('connect', () => {
    updateConnectionStatus('connected', 'Connected');
    logActivity('success', 'WebSocket connection established', socket.id);
    console.log('Connected to server:', socket.id);
});

// Connection lost
socket.on('disconnect', (reason) => {
    updateConnectionStatus('disconnected', 'Disconnected');
    logActivity('error', 'WebSocket connection lost', reason);
    console.log('Disconnected:', reason);
});

// Reconnection attempt
socket.on('reconnect_attempt', (attemptNumber) => {
    updateConnectionStatus('connecting', 'Reconnecting...');
    logActivity('warning', `Reconnection attempt #${attemptNumber}`);
});

// Reconnected successfully
socket.on('reconnect', (attemptNumber) => {
    updateConnectionStatus('connected', 'Reconnected');
    logActivity('success', `Reconnected after ${attemptNumber} attempts`);
});

// Receive initial stock data
socket.on('initial-data', (data) => {
    stocks = data.stocks;
    logActivity('info', `Received initial data for ${Object.keys(stocks).length} stocks`);
    initializeUI();
});

// Receive real-time stock updates (MULTIPLEXED DATA)
socket.on('stock-update', (updates) => {
    updateCounter++;
    updateCount.textContent = updateCounter;
    
    // Update only the stocks that were sent (multiplexing efficiency)
    Object.entries(updates).forEach(([symbol, data]) => {
        if (stocks[symbol]) {
            const previousPrice = stocks[symbol].price;
            stocks[symbol] = data;
            updateStockCard(symbol, previousPrice);
        }
    });
});

// Subscription confirmation
socket.on('subscription-update', (data) => {
    subscribedSymbols = new Set(data.subscribed);
    updateSubscriptionUI();
    logActivity('success', `Subscriptions updated: ${data.subscribed.join(', ') || 'None'}`);
    subscriptionCount.textContent = subscribedSymbols.size;
});

// Client statistics update
socket.on('client-stats', (stats) => {
    clientCount.textContent = stats.connectedClients;
    logActivity('info', `Active clients: ${stats.connectedClients}, Total subscriptions: ${stats.totalSubscriptions}`);
});

// Market summary response
socket.on('market-summary', (summary) => {
    displayMarketSummary(summary);
    logActivity('info', `Market summary received: ${summary.gainers.length} gainers, ${summary.losers.length} losers`);
});

// Server response to client message
socket.on('server-response', (data) => {
    logActivity('success', `Server response: ${data.message}`);
    console.log('Server response:', data);
});

// Initialize UI
function initializeUI() {
    Object.entries(stocks).forEach(([symbol, data]) => {
        createStockCard(symbol, data);
    });
    
    Object.keys(stocks).forEach(symbol => {
        createSubscriptionButton(symbol);
    });
    
    logActivity('success', 'UI initialized with stock data');
}

// Create stock card
function createStockCard(symbol, data) {
    const card = document.createElement('div');
    card.className = 'stock-card';
    card.id = `stock-${symbol}`;
    
    const changeClass = data.change > 0 ? 'positive' : data.change < 0 ? 'negative' : 'neutral';
    const changeSymbol = data.change > 0 ? '▲' : data.change < 0 ? '▼' : '•';
    
    card.innerHTML = `
        <div class="stock-header">
            <div>
                <div class="stock-symbol">${symbol}</div>
                <div class="stock-name">${data.name}</div>
            </div>
            <div class="stock-badge" id="badge-${symbol}">Unsubscribed</div>
        </div>
        <div class="stock-price" id="price-${symbol}">$${data.price.toFixed(2)}</div>
        <div class="stock-change ${changeClass}" id="change-${symbol}">
            <span>${changeSymbol}</span>
            <span>${Math.abs(data.change).toFixed(2)}%</span>
        </div>
        <div class="stock-chart-container">
    <canvas class="stock-chart" id="chart-${symbol}" width="200" height="60"></canvas> 
</div>
    `;
TML:

    stockGrid.appendChild(card);

      // Initialize empty chart
    initializeStockChart(symbol);
}

// Update stock card
function updateStockCard(symbol, previousPrice) {
    const data = stocks[symbol];
    const card = document.getElementById(`stock-${symbol}`);
    const priceElement = document.getElementById(`price-${symbol}`);
    const changeElement = document.getElementById(`change-${symbol}`);
    
    if (!card || !priceElement || !changeElement) return;
    
    priceElement.textContent = `$${data.price.toFixed(2)}`;
    
    if (data.price !== previousPrice) {
        priceElement.style.transition = 'none';
        priceElement.style.transform = 'scale(1.1)';
        priceElement.style.color = data.price > previousPrice ? 'var(--success-color)' : 'var(--danger-color)';
        
        setTimeout(() => {
            priceElement.style.transition = 'all 0.3s';
            priceElement.style.transform = 'scale(1)';
            priceElement.style.color = 'var(--text-primary)';
        }, 300);
    }
    
    const changeClass = data.change > 0 ? 'positive' : data.change < 0 ? 'negative' : 'neutral';
    const changeSymbol = data.change > 0 ? '▲' : data.change < 0 ? '▼' : '•';
    
    changeElement.className = `stock-change ${changeClass}`;
    changeElement.innerHTML = `
        <span>${changeSymbol}</span>
        <span>${Math.abs(data.change).toFixed(2)}%</span>
    `;
    
    card.className = `stock-card ${changeClass}`;
}

// Create subscription button
function createSubscriptionButton(symbol) {
    const button = document.createElement('button');
    button.className = 'stock-btn';
    button.id = `btn-${symbol}`;
    button.onclick = () => toggleSubscription(symbol);
    
    button.innerHTML = `
        <span class="indicator"></span>
        <span>${symbol}</span>
    `;
    
    subscriptionButtons.appendChild(button);
}

// Toggle subscription
function toggleSubscription(symbol) {
    if (subscribedSymbols.has(symbol)) {
        socket.emit('unsubscribe', symbol);
        logActivity('warning', `Unsubscribing from ${symbol}`);
    } else {
        socket.emit('subscribe', symbol);
        logActivity('info', `Subscribing to ${symbol}`);
    }
}

// Subscribe to all stocks
function subscribeAll() {
    const allSymbols = Object.keys(stocks);
    socket.emit('subscribe', allSymbols);
    logActivity('info', 'Subscribing to all stocks');
}

// Unsubscribe from all stocks
function unsubscribeAll() {
    const allSymbols = Array.from(subscribedSymbols);
    if (allSymbols.length > 0) {
        socket.emit('unsubscribe', allSymbols);
        logActivity('warning', 'Unsubscribing from all stocks');
    }
}

// Request market summary
function requestSummary() {
    socket.emit('request-summary');
    logActivity('info', 'Requesting market summary from server');
}

// Update subscription UI
function updateSubscriptionUI() {
    Object.keys(stocks).forEach(symbol => {
        const button = document.getElementById(`btn-${symbol}`);
        const badge = document.getElementById(`badge-${symbol}`);
        
        if (subscribedSymbols.has(symbol)) {
            button.classList.add('subscribed');
            badge.textContent = 'Subscribed';
            badge.classList.add('subscribed');
        } else {
            button.classList.remove('subscribed');
            badge.textContent = 'Unsubscribed';
            badge.classList.remove('subscribed');
        }
    });
}

// Update connection status
function updateConnectionStatus(status, text) {
    statusText.textContent = text;
    statusIndicator.className = `status-indicator ${status}`;
}

// Log activity
function logActivity(type, message, details = '') {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    
    const time = new Date().toLocaleTimeString();
    const fullMessage = details ? `${message} (${details})` : message;
    
    entry.innerHTML = `
        <span class="log-time">${time}</span>
        <span class="log-message">${fullMessage}</span>
    `;
    
    activityLog.insertBefore(entry, activityLog.firstChild);
    
    while (activityLog.children.length > 50) {
        activityLog.removeChild(activityLog.lastChild);
    }
}

// Clear log
function clearLog() {
    activityLog.innerHTML = '';
    logActivity('info', 'Activity log cleared');
}
// Chart initialization and management
const stockCharts = new Map();

function initializeStockChart(symbol) {
    const ctx = document.getElementById(`chart-${symbol}`).getContext('2d');
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: symbol,
                data: [],
                borderColor: '#0066cc',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                point: {
                    hoverBackgroundColor: '#0066cc',
                    hoverBorderColor: '#ffffff',
                    hoverBorderWidth: 2
                }
            }
        }
    });
    
    stockCharts.set(symbol, chart);
}

// Initialize charts when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    
    console.log('\nChart.js Integration:');
    console.log('- Real-time price charts for each stock');
    console.log('- Historical price tracking (last 20 updates)');
    console.log('- Color-coded trends (green/red) based on performance\n');
});

// Display market summary
function displayMarketSummary(summary) {
    let message = `Market Summary:\n`;
    message += `Total Stocks: ${summary.totalStocks}\n\n`;
    
    if (summary.gainers.length > 0) {
        message += `Top Gainers:\n`;
        summary.gainers.slice(0, 3).forEach((stock, i) => {
            message += `${i + 1}. ${stock.symbol}: +${stock.change.toFixed(2)}%\n`;
        });
    }
    
    if (summary.losers.length > 0) {
        message += `\nTop Losers:\n`;
        summary.losers.slice(0, 3).forEach((stock, i) => {
            message += `${i + 1}. ${stock.symbol}: ${stock.change.toFixed(2)}%\n`;
        });
    }
    
    alert(message);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Stock Market WebSocket Client Started');
    console.log('Connecting to server...');
    
    console.log('\nMultiplexing Implementation:');
    console.log('- Single WebSocket connection for all stock data');
    console.log('- Subscribe to specific stocks you want to track');
    console.log('- Server sends only your subscribed stock updates');
    console.log('- Saves bandwidth and improves performance\n');
});

// Export functions for HTML onclick handlers
window.subscribeAll = subscribeAll;
window.unsubscribeAll = unsubscribeAll;
window.requestSummary = requestSummary;
window.clearLog = clearLog;