const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const socket = new WebSocket(`ws://${location.host}`);

let playerId = null;
const players = new Map();

const input = {
  up: false,
  down: false,
  left: false,
  right: false,
};

function handleKey(e, isDown) {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
      input.up = isDown;
      break;
    case 'ArrowDown':
    case 's':
      input.down = isDown;
      break;
    case 'ArrowLeft':
    case 'a':
      input.left = isDown;
      break;
    case 'ArrowRight':
    case 'd':
      input.right = isDown;
      break;
  }
}

document.addEventListener('keydown', (e) => handleKey(e, true));
document.addEventListener('keyup', (e) => handleKey(e, false));

socket.addEventListener('open', () => {
  console.log('Connected to server');
});

socket.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  switch (msg.type) {
    case 'init':
      playerId = msg.id;
      msg.players.forEach((p) => {
        players.set(p.id, p);
      });
      break;
    case 'state':
      msg.players.forEach((p) => {
        players.set(p.id, p);
      });
      break;
  }
});

function update(delta) {
  const speed = 200; // pixels per second
  const me = players.get(playerId);
  if (!me) return;

  if (input.up) me.y -= speed * delta;
  if (input.down) me.y += speed * delta;
  if (input.left) me.x -= speed * delta;
  if (input.right) me.x += speed * delta;

  // Keep within bounds
  me.x = Math.max(20, Math.min(canvas.width - 20, me.x));
  me.y = Math.max(20, Math.min(canvas.height - 20, me.y));

  // Send update to server
  socket.send(JSON.stringify({ type: 'update', x: me.x, y: me.y }));
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  players.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.id === playerId ? 14 : 10, 0, Math.PI * 2);
    ctx.fill();
    if (p.id === playerId) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

let last = performance.now();
function gameLoop(now) {
  const delta = (now - last) / 1000;
  last = now;
  update(delta);
  render();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);