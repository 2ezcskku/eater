var port = process.argv[2];
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
serv.listen(port);

var SOCKET_LIST = {};
var playerList = {};
function player(id,password,x,y,score){
	var newPlayer = {
		id:id,
		password:password,
		x:x,
		y:y,
		score:score
	};
	playerList[id] = newPlayer;
}
var io = require('socket.io')(serv,{});
var playerCount = 0;
var idLen = 20;
var HI_SCORE = -1;
var HI_PLAYER = null;

console.log(colors.green('\n==========[Server Started]==========\n'));
console.log("port: "+port);

/*var possibleIdChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
var possibleLen = possibleIdChar.length;
function generateId(){
    var text = "";
    for(var i = 0; i < idLen; i++)
        text += possibleIdChar.charAt(Math.floor(Math.random()*possibleLen));
    return text;
}*/

io.sockets.on('connection', function(socket){	
	socket.emit('pleaseLogin');
	socket.on('playerLogin', function(data){
		data.id = (data.id).substring(0,6);
		function socketConnect(){			
			socket.id = (playerList[data.id].id).toString();			
			socket.x = playerList[data.id].x;
			socket.y = playerList[data.id].y;
			socket.score = playerList[data.id].score;
			socket.num = ++playerCount;
			SOCKET_LIST[socket.id] = socket;
			console.log(colors.green(' [Connect] ')+'ID:'+colors.yellow(socket.id)+', Password:'+colors.yellow(playerList[data.id].password)+', Total:'+colors.yellow(playerCount));		
			socket.emit('loginSuccessful', {
				x: socket.x,
				y: socket.y,
				num: socket.num,
				score: socket.score
			});
		}
		if(playerList[data.id] == null){//first login
			player(data.id,data.password,170,200,0);	
			socketConnect();
			
		}
		else if(SOCKET_LIST[data.id] == null && data.password == playerList[data.id].password){//has player data and not loged in
			socketConnect();
		}
		else{
			return;
		}	
		
	});
	
	socket.on('playerMove', function(data){
		var speed = 30;// 1 block = 30px
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
			console.log(colors.cyan(' [Move]')+' '+data.txt+','+colors.yellow(socket.id)+' to ('+colors.yellow(socket.x)+','+colors.yellow(socket.y)+')');
		}
					
	});
	
	socket.on('eatFood',function(data){
		ateFood = foodList[data.foodId];
		if(ateFood == null)
			return;		
		if(ateFood.x == socket.x && ateFood.y == socket.y){
			socket.score++;
			socket.emit('validPlayerScore',{score: socket.score});
			console.log(colors.blue(' [Eat] ')+'food ID:'+colors.yellow(ateFood.id)+' by '+colors.yellow(socket.id)+' score:'+colors.yellow(socket.score));
	        delete foodList[data.foodId]; 
			sendFoodPack(); 
		}
		else{
			console.log("Cheating!!!!!!!!!!!!!!!!!!!");
		}
    });
	
	socket.on('eatMonter',function(data){
		ateMonter = MonterList[data.MonterId];
		if(ateMonter == null)
			return;		
		if(ateMonter.x == socket.x && ateMonter.y == socket.y){
			socket.score--;
			if(socket.score<0){
				socket.score=0;
			}
			socket.emit('validPlayerScore',{score: socket.score});
			console.log(colors.blue(' [Eat] ')+'Monter ID:'+colors.yellow(ateMonter.id)+' by '+colors.yellow(socket.id)+' score:'+colors.yellow(socket.score));
	        MonterCount--;
	        delete MonterList[data.MonterId]; 
			sendMonterPack(); 
		}
    });

    socket.on('disconnect',function(){
		if(playerList[socket.id] != null){//ลบเฉพาะ player ที่ login แล้ว
			playerList[socket.id].x = socket.x;
			playerList[socket.id].y = socket.y;
			playerList[socket.id].score = socket.score;
				
			if(playerCount>0)
				playerCount--;
			var disConNum = socket.num;
	        delete SOCKET_LIST[socket.id];
			deletePlayer(disConNum);
			console.log(colors.red(' [Disconnect] ')+'ID:'+colors.yellow(socket.id)+', Name:'+colors.yellow(socket.id)+', Total:'+colors.yellow(playerCount));
    	}
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
});  

//===================================== player ======================================//
function sendPositionPack(){
	var pack = [];
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		pack.push({
			x:		socket.x,
			y:		socket.y,
			name:	socket.id
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
			hiPlayer: HI_PLAYER.id 
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

//===================================== Monter ======================================//
var MonterId = 0;
var MonterCount = 0;
var MonterList = {};//use {} because when deleted element, length change automatic.
function Monter(id,x,y,width,height){
	var type = Math.floor(Math.random()*3);
	var newFood = {
		id:id,
		type:type,
		x:x,
		y:y,
		width:width,
		height:height	
	};
	MonterList[id] = newFood;
	MonterCount++;
}

function sendMonterPack(){
	var pack = [];
	for(var i in MonterList){
		var Monter = MonterList[i];
		pack.push({
			id:		Monter.id,
			type:	Monter.type,
			x:		Monter.x,
			y:		Monter.y,
			width:	Monter.width,
			height:	Monter.height
		});	
	}		
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];		
		socket.emit('sendMonter', pack);
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
	sendMonterPack();
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
			for(var i in MonterList){
				var aMonter = MonterList[i];
				if(x == aMonter.x && y == aMonter.y){
					blank = false;
					//console.log("not blank");
					break;
				}
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


setInterval(function(){
	if(MonterCount <= playerCount*4){
		var blank = true;
		var x = Math.floor((Math.random()*11));
		var y = Math.floor((Math.random()*13));
		x = mapx[x];
		y = mapy[y];
		for(var i in MonterList){
			var aMonter = MonterList[i];
			if(x == aMonter.x && y == aMonter.y){
				blank = false;
				//console.log("not blank");
				break;
			}
		}
		
		if(blank){
			for(var i in foodList){
				var afood = foodList[i];
				if(x == afood.x && y == afood.y){
					blank = false;
					//console.log("not blank");
					break;
				}
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
			Monter(MonterId,x,y,30,30);
			MonterId++;
			console.log("monster born id:",MonterId);
		}	
	}
},5000);
