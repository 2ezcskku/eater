var foodList = {};
function food(id,type,x,y,width,height){
	var newFood = {
		id:id,
		type:type,
		x:x,
		y:y,
		width:width,
		height:height	
	};
	foodList[id] = newFood;
}

socket.on('sendFoods', function(data){
	foodList = {};//foodList.length = data.length;
	for(var i in data){	
		food(data[i].id,data[i].type,parseInt(data[i].x),parseInt(data[i].y),parseInt(data[i].width),parseInt(data[i].height));
	}
});  
	
function drawFoodPosition(){
	for(var i in foodList){		
		ctx.drawImage(foodImg[foodList[i].type],foodList[i].x- (foodList[i].width/2),foodList[i].y - (foodList[i].height/2),foodList[i].width,foodList[i].height);				
	}	
}
