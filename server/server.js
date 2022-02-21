const httpServer = require('http').createServer();
const {createGameState, gameLoop,getUpdatedVelocity} = require('./game');
const {FRAME_RATE} = require('./constants');

const io = require('socket.io')(httpServer, 
  { 
		cors: {    
			origin: "*",    
			methods: ["GET", "POST"]  
		}
	});

let keyCode;
const state =  {};
const clientRooms = {};

io.on('connection', client => {
	const state = createGameState();
	client.on('keydown', handleKeydown)	;
	client.on('newGame', handleNewGame)	;
	client.on('newGame', handleNewGame)	;

	function handleNewGame() {
		let roomName = makeId(5);
		clientRooms[client.id] = roomName;
		client.emit('gameCode', roomName);

		state[roomName] = initGame();
		client.join(roomName);
		client.number = 1;
		client.emit('init', 1);

	}
	function handleKeydown(KeyCode) {
		try {
		keyCode = parseInt(KeyCode);
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

