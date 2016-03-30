function getDistance(obj1,obj2){
	var vx = obj1.x - obj2.x;
	var vy = obj1.y - obj2.y;
	return Math.sqrt(vx*vx+vy*vy);
}

function Collision(obj1,obj2){	
	var distance = getDistance(obj1,obj2);
	return distance == 0;
}

function checkPlayerCollision(x,y){		
	//player and player
	for(var i in playerList){
		var other = playerList[i];		
		if(x == other.x && y == other.y){
			return true;
		}
	}	
	return false;
}

function checkWallCollision(x,y){		
	//wall and player
	for(var i in wallList){
		var wall = wallList[i];		
		if(x == wall.x && y == wall.y){
			return true;
		}
	}
	return false;
}

function checkFoodCollision(){		
	//food and player
	for(var i in foodList){		
		var isColliding = Collision(player,foodList[i]);
		if(isColliding){
			var tmpId = foodList[i].id;			
			socket.emit('eatFood', {
				foodId: tmpId
			});	
			delete foodList[i];
			addScore(1);			
		}	
	}
}