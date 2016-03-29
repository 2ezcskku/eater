function getDistance(obj1,obj2){
	var vx = obj1.x - obj2.x;
	var vy = obj1.y - obj2.y;
	return Math.sqrt(vx*vx+vy*vy);
}

function Collision(obj1,obj2){	
	var distance = getDistance(obj1,obj2);
	return distance == 0;
}

function checkCollision(){	
	
	//player and player
	/*for(var i in foodList){		
		var isColliding = Collision(player,foodList[i]);
		if(isColliding){
			console.log('Colliding!');
			var tmpId = foodList[i].id;
			delete foodList[i];
			socket.emit('eatFood', {
				name: player.name,
				id: tmpId
			});				
		}	
	}*/

	//food and player
	for(var i in foodList){		
		var isColliding = Collision(player,foodList[i]);
		if(isColliding){
			var tmpId = foodList[i].id;
			delete foodList[i];
			addScore(1);
			socket.emit('eatFood', {
				eaterId: player.id,
				foodId: tmpId
			});				
		}	
	}
}