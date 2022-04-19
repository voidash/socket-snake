const BG_COLOR = '#2d2d30';
const SNAKE_COLOR = '#fff';
const FOOD_COLOR = 'red';


const socket = io('http://localhost:3000')


socket.on('init', handleInit);
socket.on('gameState', handleGame);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);

const initialScreen = document.getElementById('initialScreen');
const gameScreen = document.getElementById('gameScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

joinGameBtn.addEventListener('click', joinGame);
newGameBtn.addEventListener('click', newGame);


function newGame() {
	socket.emit('newGame');
	init();
}


function joinGame() {
	const code = gameCodeInput.value;
	socket.emit('joinGame',code);
	init();
}


let canvas, ctx;
let playerNumber;
let gameActive = false;


function init() {
	initialScreen.style.display = 'none';
	gameScreen.style.display = 'block';
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');

	canvas.width = canvas.height = 800;
	ctx.fillStyle = BG_COLOR;
	ctx.fillRect(0,0, canvas.width, canvas.height);


	document.addEventListener('keydown', keydown);
	gameActive = true;
}

function keydown(e) {
	socket.emit('keydown', e.keyCode);
}


function paintGame(state) {
	ctx.fillStyle = BG_COLOR;
	ctx.fillRect(0,0,canvas.width, canvas.height);

	const food = state.food;
	const gridSize = state.gridSize;
	const size = canvas.width / gridSize;

	ctx.fillStyle = FOOD_COLOR;
	ctx.fillRect(food.x * size, food.y*size , size, size);

	paintPlayer(state.players[0], size, SNAKE_COLOR);
	paintPlayer(state.players[1], size, 'blue');
}

function paintPlayer(playerState, size, color) {
	const snake = playerState.snake;

	ctx.fillStyle = color;
	for(let cell of snake) {
		ctx.fillRect(cell.x * size, cell.y * size, size, size);
	}
}


function handleInit(number){
	playerNumber = number;
}

function handleGame(gameState) {
	if(!gameActive) {
		return;
	}

	gameState = JSON.parse(gameState);
	requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(gameState) {
	
	if(JSON.parse(gameState).winner == playerNumber){
		alert('You Won');
	}else{
		alert("you lose");
	}
	gameActive = false;
}

function handleGameCode(gameCode) {
	gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
	reset();
	alert('Unknown game code');
}

function tooManyPlayers() {
	reset();
	alert("this game is already in progress");
}

function reset() {
	playerNumber = null;
	gameCodeInput.value = "";
	gameCodeDisplay.innerText = "";
	initialScreen.style.display = "block";
	gameScreen.style.display = "none";
	
}
