var gameVersion = "Eater v1.2";
(document.getElementById('gameVersion')).innerHTML = gameVersion;

var setName = ["BonuZz","Ko","Biw","Note","Big","Small","Palm","Pond"];
var ranName = setName[Math.floor(Math.random()*setName.length)];
var player = {
	x : 170,
	y : 200,
	num : -1,
	name:ranName,
	score:0,
	hiScore:0
};
player.name =  prompt("Please enter your name",player.name); // prompt before run socket.io to prevent non-blocking issue.<-----old
var socket = io();

socket.on('sendPlayerData', function(data){
	player.num = data.num;
	player.score = data.score;
	//console.log('player.num '+data.num);
});	

socket.emit('playerEnterName', {name: player.name});
	
socket.on('playerDisconnected',function(data){
	player.num = data.newNum;
	console.log('new playersNumber: ',player.num);
});

setInterval(function(){		
	drawEverything();
	checkFoodCollision();
},1000/25);
