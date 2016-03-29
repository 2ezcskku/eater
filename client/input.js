document.addEventListener('keyup', function (evt) {			
	var text;
	if (evt.keyCode == 87 || evt.keyCode == 38) {
		text = 'up';
	}
	else if (evt.keyCode == 83 || evt.keyCode ==  40) {
		text = 'down';
	}
	else if (evt.keyCode == 65 || evt.keyCode ==  37) {
		text = 'left';
	}
	else if (evt.keyCode == 68 || evt.keyCode ==  39) {
		text = 'right';
	}			
	
	playerMove(text);		
});

function playerMove(text){
	socket.emit('playerMove', {
		txt: text,
		id: player.id,
		speed: 30
	})	
	//playerMove_Prediction(text);	
}


function playerMove_Prediction(text){		
	var speed = 30;
	if(text == 'left' && playerList[player.num].x-speed >= 0){
		playerList[player.num].x-=speed;
	}
	else if(text == 'right' && playerList[player.num].x+speed <= 340){
		playerList[player.num].x+=speed;
	}
	else if(text == 'up' && playerList[player.num].y-speed >= 0){
		playerList[player.num].y-=speed;
	}
	else if(text == 'down' && playerList[player.num].y+speed <= 400){
		playerList[player.num].y+=speed;
	}
	//console.log("[LOCAL]player: "+ name +" move "+text);
}