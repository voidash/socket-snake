const httpServer = require('http').createServer();
const {makeId} = require('./utils');
const {FRAME_RATE} = require('./constants');
const {createGameState ,initGame, gameLoop, getUpdatedVelocity } = require('./game');
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
	client.on('keydown', handleKeydown)	;
	client.on('newGame', handleNewGame)	;
	client.on('joinGame', handleJoinGame)	;

	function handleJoinGame(gameCode) {
		const room = io.sockets.adapter.rooms.get(gameCode.trim());

		let allUsers;

		let numClients = room.size;
		if (allUsers) {
			numClients = Object.keys(allUsers).length;
		}

		if(numClients === 0){
			client.emit('unknownGame');
			return;
		}else if(numClients > 1) {
			client.emit("tooManyPlayers");
			return;
		}

		clientRooms[client.id] = gameCode;
		client.join(gameCode);
		client.number = 2;
		client.emit('init',2);


		startGameInterval(gameCode);
	}

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
		const roomName = clientRooms[client.id];

		if(!roomName) {
			return;
		}

		try {
		keyCode = parseInt(KeyCode);
		}catch(e) {
			console.error(e);
			return;
		}

		const vel = getUpdatedVelocity(keyCode);

		if(vel) {
			state[roomName].players[client.number - 1].vel = vel;
		}
	}

function startGameInterval(roomName) {
	const intervalId = setInterval(() => {
		const winner = gameLoop(state[roomName]);
		if (!winner) {
			emitGameState(roomName,state[roomName]);
			client.emit('gameState', JSON.stringify(state[roomName]));
		}else {
			emitGameOver(roomName,winner);
			state[roomName] = null;
			client.emit('gameOver');
			clearInterval(intervalId);
		}
	}, 1000/FRAME_RATE);


	function emitGameState(roomName, state) {
		io.sockets.in(roomName).emit('gameState', JSON.stringify(state));
	}

	function emitGameOver(roomname,winner){ 
		io.sockets.in(roomName).emit('gameOver', JSON.stringify({winner}));
	}

}

});

io.listen(3000);

