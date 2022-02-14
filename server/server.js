const httpServer = require('http').createServer();
const {createGameState, gameLoop} = require('./game');
const {FRAME_RATE} = require('./constants');

const io = require('socket.io')(httpServer, 
  { 
		cors: {    
			origin: "*",    
			methods: ["GET", "POST"]  
		}
	});

io.on('connection', client => {
	const state = createGameState();
	client.on('keydown', handleKeydown)	;

	function handleKeydown(KeyCode) {
		try {
			let keyCode = parseInt(keyCode);
		}catch(e) {
			console.error(e);
			return;
		}

		const vel = getUpdatedVelocity(keyCode);

		if(vel) {
			state.player.vel = vel;
		}
	}
	startGameInterval(client, state);
});

function startGameInterval(client, state) {
	client.emit('init', 'hello nepal');
	const intervalId = setInterval(() => {
		const winner = gameLoop(state);
		if (!winner) {
			client.emit('gameState', JSON.stringify(state));
		}else {
			client.emit('gameOver');
			clearInterval(intervalId);
		}
	}, 1000/FRAME_RATE);
}

io.listen(3000);
