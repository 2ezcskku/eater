var wallList = {};
function wall(id,x,y,width,height){
	var newWall = {
		id:id,
		x:x,
		y:y,
		width:width,
		height:height	
	};
	wallList[id] = newWall;
}

socket.on('sendWalls', function(data){
	wallList = {};
	for(var i = 0; i < data.length; i++){	
		wall(data[i].id,parseInt(data[i].x),parseInt(data[i].y),parseInt(data[i].width),parseInt(data[i].height));		
	}
});  
	
function drawWallPosition(){
	for(var i in wallList){		
		ctx.drawImage(wallImg,wallList[i].x- (wallList[i].width/2),wallList[i].y - (wallList[i].height/2),wallList[i].width,wallList[i].height);	
			
	}	
}
