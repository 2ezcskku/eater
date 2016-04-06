<<<<<<< HEAD
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
=======
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
>>>>>>> refs/remotes/origin/add-login
	
socket.on('playerDisconnected',function(data){
	player.num = data.newNum;
	console.log('new playersNumber: ',player.num);
});

<<<<<<< HEAD
setInterval(function(){		
	drawEverything();
	checkFoodCollision();
},1000/25);
=======

>>>>>>> refs/remotes/origin/add-login
