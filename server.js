var express = require('express');
var favicon = require('serve-favicon');
var app = express();
var serv = require('http').Server(app);
var colors = require('colors/safe');
var mapx=[20,50,80,110,140,170,200,230,260,290,320];
var mapy=[20,50,80,110,140,170,200,230,260,290,320,350,380];

app.get('/',function(req,res){
		res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client/'));
app.use(favicon(__dirname + '/server/favicon.ico'));//not work
serv.listen(2000);	//serv.listen(2000,'192.168.137.1');	

var SOCKET_LIST = {};
var io = require('socket.io')(serv,{});
var playerCount = 0;
var idLen = 20;
var HI_SCORE = -1;
var HI_PLAYER = null;

console.log(colors.green('\n==========[Server Started]==========\n'));

var possibleIdChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
var possibleLen = possibleIdChar.length;
function generateId(){
    var text = "";
    for(var i = 0; i < idLen; i++)
        text += possibleIdChar.charAt(Math.floor(Math.random()*possibleLen));
    return text;
}

io.sockets.on('connection', function(socket){
	playerCount++;
	socket.id = generateId();
	socket.name = "";
	socket.num = playerCount;
	socket.score = 0;
	socket.x = 170;
	socket.y = 200;
	socket.ip = socket.handshake.address;
	SOCKET_LIST[socket.id] = socket;
	
	socket.emit('sendPlayerData', {
		num: socket.num,
		score: socket.score
	});
	
	socket.on('playerEnterName', function(data){
		socket.name = data.name;
		socket.name = (socket.name).substring(0,6);
		console.log(colors.green(' [Connect] ')+'ID:'+colors.yellow(socket.id)+', Name:'+colors.yellow(socket.name)+', Total:'+colors.yellow(playerCount));
	});
	
	socket.on('playerMove', function(data){
		/*console.log('move',socket.handshake.address);
			if(!checkIP_Player(socket)){
			console.log('not match');
			return;
		}*/

		var speed = data.speed;
		var canMove = false;
		var new_x = socket.x;
		var new_y = socket.y;
		if(data.txt == 'left' && new_x-speed >= 0){
			new_x-=speed;
			canMove = true;
		}
		else if(data.txt == 'right' && new_x+speed <= 340){
			new_x+=speed;
			canMove = true;
		}
		else if(data.txt == 'up' && new_y-speed >= 0){
			new_y-=speed;
			canMove = true;
		}
		else if(data.txt == 'down' && new_y+speed <= 400){
			new_y+=speed;
			canMove = true;
		}	
		
		if(canMove){
			for(var i in SOCKET_LIST){
				var other = SOCKET_LIST[i];		
				if(new_x == other.x && new_y == other.y){
					canMove = false;
					break;
				}
			}	
		}

		if(canMove){
			for(var i in wallList){
				var wall = wallList[i];		
				if(new_x == wall.x && new_y == wall.y){
					canMove = false;
					break;
				}
			}	
		}
		
		if(canMove){
			socket.x = new_x;
			socket.y = new_y;
			console.log(colors.cyan(' [Move]')+' '+data.txt+','+colors.yellow(socket.name)+' to ('+colors.yellow(socket.x)+','+colors.yellow(socket.y)+')');
		}
					
	});
	
	socket.on('disconnect',function(){
		playerCount--;
		console.log(colors.red(' [Disconnect] ')+'ID:'+colors.yellow(socket.id)+', Name:'+colors.yellow(socket.name)+', Total:'+colors.yellow(playerCount));
		var disConNum = socket.num;
        delete SOCKET_LIST[socket.id];
		deletePlayer(disConNum);
    });
	
	function deletePlayer(disConNum){
		sendPositionPack();		
		for(var i in SOCKET_LIST){
			var socket = SOCKET_LIST[i];
			if(socket.num > disConNum){
				socket.num--;
				socket.emit('playerDisconnected',{newNum: socket.num});		
			}
			
		}
	}	
	
	socket.on('eatFood',function(data){
		ateFood = foodList[data.foodId];
		if(ateFood == null)
			return;		
		if(ateFood.x == socket.x && ateFood.y == socket.y){
			socket.score++;
			socket.emit('validPlayerScore',{score: socket.score});
			console.log(colors.blue(' [Eat] ')+'food ID:'+colors.yellow(ateFood.id)+' by '+colors.yellow(socket.name)+' score:'+colors.yellow(socket.score));
	        delete foodList[data.foodId]; 
			sendFoodPack(); 
		}
		else{
			console.log("Cheating!!!!!!!!!!!!!!!!!!!");
		}
    });
});  

//===================================== player ======================================//
function sendPositionPack(){
	var pack = [];
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		pack.push({
			x:		socket.x,
			y:		socket.y,
			name:	socket.name
		});		
	}		
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];		
		socket.emit('newPositions', pack);
	}
} 

function checkHiScore(){
	var hiPlayer;
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];		
		if(socket.score > HI_SCORE){
			HI_SCORE = socket.score;
			HI_PLAYER = socket;
		}
	}	
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];		
		socket.emit('updateHiScore', {
			hiScore : HI_SCORE,
			hiPlayer: HI_PLAYER.name 
		});
	}
}

//===================================== food ======================================//
var foodList = {};//use {} because when deleted element, length change automatic.
function food(id,x,y,width,height){
	var type = Math.floor(Math.random()*3);
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

var foodId = 0;

function sendFoodPack(){
	var pack = [];
	for(var i in foodList){
		var food = foodList[i];
		pack.push({
			id:		food.id,
			type:	food.type,
			x:		food.x,
			y:		food.y,
			width:	food.width,
			height:	food.height
		});	
	}		
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];		
		socket.emit('sendFoods', pack);
	}
}

//===================================== wall ======================================//
var wallList = {};//use {} because when deleted element, length change automatic.
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
function sendWallPack(){
	var pack = [];
	for(var i in wallList){
		var wall = wallList[i];
		pack.push({
			id:		wall.id,
			x:		wall.x,
			y:		wall.y,
			width:	wall.width,
			height:	wall.height
		});			
	}		
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];		
		socket.emit('sendWalls', pack);
	}
}
//generate walls
var wallId = 0;// for loop
for(var i = 0; i <= 10; i++){
	wall(wallId++,mapx[i],mapy[12],30,30);
}

for(var i = 0; i < 50; i++){
	do{
		var ranx = Math.floor(Math.random()*11);
		var rany = Math.floor(Math.random()*11+2);// not over logo
		var inPath = ((ranx < 4 || ranx > 6 || rany < 5 || rany > 7) && (ranx != 3 && ranx != 7 && rany != 3 && rany != 4 && rany != 9 && rany != 11));
		var duplicate = false;
		for(var j in wallList){
			var otherwall = wallList[j];
			if(otherwall.x == mapx[ranx] && otherwall.y == mapy[rany]){
				duplicate = true;
				break;
			}
		}	
	}while(!inPath && !duplicate);
	wall(wallId++,mapx[ranx],mapy[rany],30,30);
}

setInterval(function(){
	sendPositionPack();
	sendFoodPack();
	sendWallPack();
	checkHiScore();
},1000/25);

setInterval(function(){
	for(var j = 0; j < playerCount; j++){
		var blank = true;
		var x = Math.floor((Math.random()*11));
		var y = Math.floor((Math.random()*13));
		x = mapx[x];
		y = mapy[y];
		for(var i in foodList){
			var afood = foodList[i];
			if(x == afood.x && y == afood.y){
				blank = false;
				//console.log("not blank");
				break;
			}
		}
		
		if(blank){
			for(var i in SOCKET_LIST){
				var socket = SOCKET_LIST[i];
				if(x == socket.x && y == socket.y){
					blank = false;
					break;
				}
			}
		}	
		
		if(blank){
			for(var i in wallList){
				var wall = wallList[i];		
				if(x == wall.x && y == wall.y){
					blank = false;
					break;
				}
			}	
		}		
		
		if(blank){
			food(foodId,x,y,30,30);
			foodId++;
		}	
	}
},2000);


