document.addEventListener('keyup', function (evt) {			
	if(player.name != null){
		if (evt.keyCode == 87 || evt.keyCode == 38) {
			playerMove('up');
		}
		else if (evt.keyCode == 83 || evt.keyCode ==  40) {
			playerMove('down');
		}
		else if (evt.keyCode == 65 || evt.keyCode ==  37) {
			playerMove('left');
		}
		else if (evt.keyCode == 68 || evt.keyCode ==  39) {
			playerMove('right');
		}		 
	}

	if(evt.keyCode == 13 && !loggedIn){
		playerLogin();
		console.log('press enter');
	}			
});

function playerMove(text){
	socket.emit('playerMove', {
		txt: text,
		speed: 30
	});// use non-blocking concept to do client-side prediction. (emit ส่งยังไม่ถึง server ก็สามารถทำบรรทัดต่อไปได้ทันที)
	playerMove_Prediction(text,30);	
}


function playerMove_Prediction(text,speed){		
	var canMove = false;
	var new_x = player.x;
	var new_y = player.y;
	if(text == 'left' && player.x-speed >= 0){
		canMove = true;
		new_x-=speed;
	}
	else if(text == 'right' && player.x+speed <= 340){
		canMove = true;
		new_x+=speed;
	}
	else if(text == 'up' && player.y-speed >= 0){
		canMove = true;
		new_y-=speed;
	}
	else if(text == 'down' && player.y+speed <= 400){
		canMove = true;
		new_y+=speed;
	}

	if(canMove){
		canMove = !checkPlayerCollision(new_x,new_y);
	}

	if(canMove){
		canMove = !checkWallCollision(new_x,new_y);
	}
		
	if(canMove){
		player.x = new_x;
		player.y = new_y;
		//console.log("[LOCAL]player: "+ player.name +" move "+text);		
	}
}