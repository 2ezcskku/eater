var gameVersion = "1.4";
(document.getElementById('gameVersion')).innerHTML += "v"+gameVersion;
(document.getElementById('gameLogo')).innerHTML += "v"+gameVersion;
var player = {
	x : -100,
	y : -100,
	num : -1,
	name:null,
	score:0,
	hiScore:0
};
var socket = io();

setInterval(function(){		
	drawEverything();
	checkFoodCollision();
},1000/25);


function playerLogin(){
	player.name = document.getElementById("username").value;
	if((player.name).match(/[a-z]/i) != null){
			socket.emit('playerLogin', {
			id: player.name,
			password: document.getElementById("password").value
		});
	}	
}

socket.on('pleaseLogin', function(){
	(document.getElementById('login')).style.display = "inline";
	(document.getElementById('game')).style.display = "none";
});	

socket.on('loginSuccessful', function(data){
	player.x = data.x;
	player.y = data.x;
	player.num = data.num;
	player.score = data.score;
	(document.getElementById('login')).style.display = "none";
	(document.getElementById('game')).style.display = "inline";
});	
	
socket.on('playerDisconnected',function(data){
	player.num = data.newNum;
	console.log('new playersNumber: ',player.num);
});


