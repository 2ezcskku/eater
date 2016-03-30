function addScore(n){
	player.score+=n;
}

socket.on('updateHiScore',function(data){
	player.hiScore = data.hiScore;
	hiPlayer = data.hiPlayer;
});

socket.on('validPlayerScore',function(data){
	player.score = data.score;
});

function drawScore(){
	ctx.textAlign = "right";
	ctx.fillStyle = 'black';
	ctx.font = 'bold 15px Arial';			
	ctx.fillText('Score: '+player.score,330,390);
	ctx.textAlign = "left";
	//ctx.fillStyle = '#ffe6e6';
	ctx.fillText('Hi-Score',8,378);
	ctx.fillText(hiPlayer+': '+player.hiScore,8,393);
}