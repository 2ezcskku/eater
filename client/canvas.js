var canvas = document.getElementById("ctx");
var ctx = canvas.getContext("2d");	
canvas.width = 340;
canvas.height = 400;
var playerImg = document.getElementById("playerImg");	
var logoImg = document.getElementById("logoImg");
var ghostImg = document.getElementById("ghostImg");
var wallImg = document.getElementById("wallImg");

var foodImg=[];
foodImg[0] = document.getElementById("orangeImg");
foodImg[1] = document.getElementById("pineAppImg");
foodImg[2] = document.getElementById("donutImg");

function drawEverything(){ //draw players for main loop
	ctx.fillStyle = "#784800";
	ctx.clearRect(0,0,340,400);
	ctx.fillRect(0,0,340,400);
	
	ctx.textAlign = "center";
	ctx.fillStyle = '#00ff99';
	ctx.font = '40px Arial';
	ctx.fillText(gameVersion,170,45);	
	drawWallPosition();
	drawFoodPosition();
	drawPlayersPosition();
	drawScore();
}