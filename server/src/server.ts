import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { randomUUID } from 'crypto';

interface Player {
  id: string;
  x: number;
  y: number;
  color: string;
}

type ClientMessage = {
  type: 'update';
  x: number;
  y: number;
};

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// Serve static client files
app.use(express.static(path.join(__dirname, '../../client')));

const players: Map<string, Player> = new Map();

function broadcastState() {
  const state = Array.from(players.values());
  const payload = JSON.stringify({ type: 'state', players: state });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}

wss.on('connection', (ws) => {
  const id = randomUUID();
  const newPlayer: Player = {
    id,
    x: Math.random() * 760 + 20,
    y: Math.random() * 560 + 20,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
  };
  players.set(id, newPlayer);

  // Send init packet
  ws.send(
    JSON.stringify({ type: 'init', id, player: newPlayer, players: Array.from(players.values()) })
  );

  ws.on('message', (data) => {
    try {
      const msg: ClientMessage = JSON.parse(data.toString());
      if (msg.type === 'update') {
        const p = players.get(id);
        if (p) {
          p.x = msg.x;
          p.y = msg.y;
        }
      }
    } catch (err) {
      console.error('Failed to parse message', err);
    }
  });

  ws.on('close', () => {
    players.delete(id);
  });
});

// Broadcast state 30 times per second
setInterval(broadcastState, 1000 / 30);

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});