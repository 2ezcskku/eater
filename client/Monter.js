var MonterList = {};
function Monter(id,type,x,y,width,height){
	var newMonter = {
		id:id,
		type:type,
		x:x,
		y:y,
		width:width,
		height:height	
	};
	MonterList[id] = newMonter;
}

socket.on('sendMonter', function(data){
	MonterList = {};//MonterList.length = data.length;
	for(var i in data){	
		Monter(data[i].id,data[i].type,parseInt(data[i].x),parseInt(data[i].y),parseInt(data[i].width),parseInt(data[i].height));
	}
	console.log("monter born");
});  
	
function drawMonterPosition(){
	for(var i in MonterList){		
		ctx.drawImage(MonterImg[MonterList[i].type],MonterList[i].x- (MonterList[i].width/2),MonterList[i].y - (MonterList[i].height/2),MonterList[i].width,MonterList[i].height);				
	}	
}