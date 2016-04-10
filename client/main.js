var gameVersion = "1.5";//1.5 add monster + login
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
var loggedIn = false;

setInterval(function(){		
	if(loggedIn){
		drawEverything();
		checkFoodCollision();
		checkMonterCollision();
	}	
},1000/25);


function playerLogin(){
	player.name = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	var loginText = document.getElementById("login-text");
	if((player.name).match(/[a-z]/i) == null){
		loginText.style.color = 'red';
		loginText.innerHTML = "<br><br>Warning!!!<br> Username must contain at least 1 alphabet."; 
	}
	else if((player.name).length > 6){
		loginText.style.color = 'red';
		loginText.innerHTML = "<br><br>Warning!!!<br> Username must contain 1 - 6 characters.";
	}
	else if(password.length < 4){
		loginText.style.color = 'red';
		loginText.innerHTML = "<br><br>Warning!!!<br> Password must contain at least 4 characters.";
	}	
	else{
		socket.emit('playerLogin', {
			id: player.name,
			password: password
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
	loggedIn = true;
	(document.getElementById('login')).style.display = "none";
	(document.getElementById('game')).style.display = "inline";
});	
	
socket.on('playerDisconnected',function(data){
	player.num = data.newNum;
	console.log('new playersNumber: ',player.num);
});


