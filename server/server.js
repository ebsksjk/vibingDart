// server.js
const path = require('path');  // Add this line
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');


const app = express();
const server = http.createServer(app);

const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
const lport = 3000;

// Add this to your existing Express setup
app.get('/network-info', (req, res) => {
  res.json({
    ip: localIP,
    port: lport,
    connectionUrl: `http://${localIP}:${lport}`
  });
});

console.log(`Local network IP: http://${localIP}:${lport}`);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let players = [];
let gameType = '301';
let gameActive = false;

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Player registration
  socket.on('registerPlayer', (player) => {
    if (!players.some(p => p.id === player.id)) {
      players.push({ ...player, score: 0, history: [] });
      io.emit('playerConnected', player);
    }
  });
  
  // Start game
  socket.on('startGame', ({ players: gamePlayers, gameType: gt }) => {
    gameType = gt;
    gameActive = true;
    players = gamePlayers;
    io.emit('gameStarted', { players, gameType });
  });
  
  // Score submission
  socket.on('submitScore', ({ playerId, score, remaining }) => {
    if (!gameActive) return;
    
    const playerIndex = players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;
    
    players[playerIndex].score = remaining;
    players[playerIndex].history.push(score);
    console.log('Emitting scoreUpdate', players);
    io.emit('scoreUpdate', players);
  });
  
  // Reset game
  socket.on('resetGame', () => {
    gameActive = false;
    players = players.map(p => ({ ...p, score: parseInt(gameType), history: [] }));
    io.emit('gameReset', { players, gameType });
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});