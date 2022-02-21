const BG_COLOR = '#2d2d30';
const SNAKE_COLOR = '#fff';
const FOOD_COLOR = 'red';


const socket = io('http://localhost:3000')


socket.on('init', handleInit);
socket.on('gameState', handleGame);
socket.on('gameOver', handleGameOver);

const initialScreen = document.getElementById('initialScreen');
const gameScreen = document.getElementById('gameScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameBtn');
const gameCodeInput = document.getElementById('gameCodeInput');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);


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

const gameState = {
	player: {
		pos: {
			x: 3,
			y: 10,
		},
		vel: {
			x: 1,
			y: 0,
		},
		snake: [
			{x:1, y:10},
			{x:2, y:10},
			{x:3, y:10}
		]
	},
	food: {
		x: 7,
		y:7,
	},
	gridSize: 20
};

function init() {
	initialScreen.style.display = 'none';
	gameScreen.style.display = 'block';
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');

	canvas.width = canvas.height = 800;
	ctx.fillStyle = BG_COLOR;
	ctx.fillRect(0,0, canvas.width, canvas.height);


	document.addEventListener('keydown', keydown);
}

function keydown(e) {
	socket.emit('keydown', e.keyCode);
	console.log(e.keyCode);
}


function paintGame(state) {
	ctx.fillStyle = BG_COLOR;
	ctx.fillRect(0,0,canvas.width, canvas.height);

	const food = state.food;
	const gridSize = state.gridSize;
	const size = canvas.width / gridSize;

	ctx.fillStyle = FOOD_COLOR;
	ctx.fillRect(food.x * size,food.y*size , size, size);

	paintPlayer(state.player, size, SNAKE_COLOR);
}

function paintPlayer(playerState, size, color) {
	const snake = playerState.snake;

	ctx.fillStyle = color;
	for(let cell of snake) {
		ctx.fillRect(cell.x * size, cell.y * size, size, size);
	}
}

paintGame(gameState);

function handleInit(number){
	playerNumber = number;
}

function handleGame(gameState) {
	gameState = JSON.parse(gameState);
	requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(_) {
	alert("you lose");
}

