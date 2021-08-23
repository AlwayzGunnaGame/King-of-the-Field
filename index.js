const express = require('express');
const app = express();
app.use(express.static(__dirname));
const http = require('http');
var _ = require('underscore');
const server = http.createServer(app);
const io = require('socket.io')(server,{
    //path: "/socket.io",
    //pingInterval: 10 * 1000,
    //pingTimeout: 5000,
    //transports: ["websocket"],
  });

var clients = {};
var room1Queue = [];
var room2Queue = [];
var room3Queue = [];
var room1Streak = 0;
var room2Streak = 0;
var room3Streak = 0;
var room1King = "";
var room2King = "";
var room3King = "";
var room1Challenger = "";
var room2Challenger = "";
var room3Challenger = "";
var room1KingWins = 0;
var room2KingWins = 0;
var room3KingWins = 0;
var room1ChallengerWins = 0;
var room2ChallengerWins = 0;
var room3ChallengerWins = 0;

let room = 0;
let player1Rdy = 0;
let player2Rdy = 0;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const {userConnected, connectedUsers, initializeChoices, moves, makeMove, choices} = require("./util/users");
const {createRoom, joinRoom, exitRoom, rooms} = require("./util/rooms");

createRoom("room1");
createRoom("room2");
createRoom("room3");

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on("create-room", (roomId) =>{
    if(rooms[roomId]){
	const error = "This room already exists";
	socket.emit("d", {t:"display-error", d:error});
    }else{
	userConnected(socket.client.id);
	createRoom(roomId, socket.client.id);
	socket.roomId = roomId;
	socket.emit("d", {t:"room-created", d:roomId});
	socket.emit("d", {t:"player-1-connected"});
	socket.join(roomId);
	room = roomId;
	console.log('room created ', roomId);
    }
  })

  socket.on("set-name", nickname => {
    socket.username = nickname;
    clients[nickname] = socket;
	createRoom(socket.username);
	socket.join(socket.username);
	socket.roomId = socket.username;
	FullUpdate();
    console.log('Welcome ', socket.username);
    console.log('There are now ', _.size(clients), ' players online!');
  })

  var SendLobbyList = function(){
    io.emit("d", {t:"lobby-list", d:[]});
    console.log(_.keys(clients));
  }
  
  var FullUpdate = function(){
	  UpdateChallengers(1);
	  UpdateChallengers(2);
	  UpdateChallengers(3);
	  UpdateKings(1);
	  UpdateKings(2);
	  UpdateKings(3);
	  clients[socket.username].emit("d", {t:'update-1-streak', d: room1Streak});
	  clients[socket.username].emit("d", {t:'update-2-streak', d: room2Streak});
	  clients[socket.username].emit("d", {t:'update-3-streak', d: room3Streak});
  }

  var UpdateKings = function(roomNum){
    if(roomNum == 1){
      //var newKings = io.sockets.adapter.rooms[room1King].sockets;
      io.emit("d", {t:'clear-kings', d:1});
      //for(var king in newKings){
	//	var clientSocket = io.sockets.connected[king];
		io.emit("d", {t:'new-king-1', d:room1King});
        console.log(room1King, " is now the king of room 1");
    //  }
    }else if(roomNum == 2){
      //var newKings = io.sockets.adapter.rooms[room2King].sockets;
      io.emit("d", {t:'clear-kings', d:2});
      //for(var king in newKings){
	//var clientSocket = io.sockets.connected[king];
	io.emit("d", {t:'new-king-2', d:room2King});
        console.log(room2King, " is now the king of room 2");
    //  }
    }else{
      //var newKings = io.sockets.adapter.rooms[room3King].sockets;
      io.emit("d", {t:'clear-kings', d:3});
      //for(var king in newKings){
	//var clientSocket = io.sockets.connected[king];
	io.emit("d", {t:'new-king-3', d:room3King});
        console.log(room3King, " is now the king of room 3");
	//	}
	}
  }

  var UpdateChallengers = function(roomNum){
    if(roomNum == 1){
		io.emit("d", {t:'clear-challengers', d:1});
		if(room1Challenger != ""){
			//var newChallengers = io.sockets.adapter.rooms[room1Challenger].sockets;
			//for(var challenger in newChallengers){
			//	var clientSocket = io.sockets.connected[challenger];
				io.emit("d", {t:'new-challenger-1', d:room1Challenger});
				console.log(room1Challenger, " is now the challenger of room 1");
			//}
		}
		
    }else if(roomNum == 2){
		io.emit("d", {t:'clear-challengers', d:2});
		if(room2Challenger != ""){
      //var newChallengers = io.sockets.adapter.rooms[room2Challenger].sockets;
      //for(var challenger in newChallengers){
	//var clientSocket = io.sockets.connected[challenger];
	io.emit("d", {t:'new-challenger-2', d:room2Challenger});
        console.log(room2Challenger, " is now the challenger of room 2");
      //}
		}
		
    }else{
		io.emit("d", {t:'clear-challengers', d:3});
		if(room3Challenger != ""){
      //var newChallengers = io.sockets.adapter.rooms[room3Challenger].sockets;
      //for(var challenger in newChallengers){
	//var clientSocket = io.sockets.connected[challenger];
	io.emit("d", {t:'new-challenger-3', d:room3Challenger});
        console.log(room3Challenger, " is now the challenger of room 3");
		//}
		}
		
	}
  }

  
  socket.on('invite-player', invitedPlayer => {
    console.log(socket.username, " invited ", invitedPlayer);
    if(!rooms[socket.username]){
      createRoom(socket.username);
      socket.join(socket.username);
      socket.roomId = socket.username;
    }

    if(io.sockets.adapter.rooms[socket.username].length >= 3){
      console.log("Room is full invite not sent!")
      return;
    }
    
    console.log(io.sockets.adapter.rooms[socket.username].length);
    clients[invitedPlayer].emit("d", {t:'get-invited', d:socket.username});
  })
  
  socket.on('accept-invite', inviteSender => {
    console.log(socket.username, " accepted ", inviteSender);
    if(rooms[socket.username]){
      socket.leave(socket.username);
    }
    if(io.sockets.adapter.rooms[inviteSender].length >= 3){
      console.log("Could not join room. Room Full.");
      return;
    }
    var partyMembers = io.sockets.adapter.rooms[inviteSender].sockets;
    for(var member in partyMembers){
      var clientSocket = io.sockets.connected[member];
      console.log(socket.username, " + ",clientSocket.username); 
      clients[clientSocket.username].emit("d", {t: 'join-party', d:socket.username});
      clients[socket.username].emit("d", {t: 'join-party', d: clientSocket.username});
    }
    socket.join(inviteSender);
    socket.roomId = inviteSender; 
  })

  socket.on('request-room', requestedRoom => {
    console.log(socket.username, " wants to join ", requestedRoom);
    //var partyMembers = io.sockets.adapter.rooms[socket.username].sockets;
    //for(var member in partyMembers){
    //  var clientSocket = io.sockets.connected[member];
      socket.join(requestedRoom);
    //}
    if(requestedRoom == "room1"){
      if(room1King == ""){
	room1King = socket.username;
	UpdateKings(1);
      }else if(room1Challenger == ""){
	room1Challenger = socket.username;
	UpdateChallengers(1);
      }else{
      room1Queue.push(socket.username);
      console.log(room1Queue);
      }
    }else if(requestedRoom == "room2"){
      if(room2King == ""){
	room2King = socket.username;
	UpdateKings(2);
      }else if(room2Challenger == ""){
	room2Challenger = socket.username;
	UpdateChallengers(2);
      }else{
      room2Queue.push(socket.username);
      console.log(room2Queue);
      }
    }else{
      if(room3King == ""){
	room3King = socket.username;
	UpdateKings(3);
      }else if(room3Challenger == ""){
	room3Challenger = socket.username;
	UpdateChallengers(3);
      }else{
      room3Queue.push(socket.username);
      console.log(room3Queue);
      }
    }
	clients[socket.username].emit("d", {t:'join-room', d:requestedRoom});
    //io.to(socket.username).emit("d", {t: 'join-room', d: requestedRoom});
  })

  socket.on('king-win', matchRoom => {
	  console.log("King Win happened");
    if(matchRoom == "room1"){
      room1KingWins++;
      if(room1KingWins == 2 && room1ChallengerWins == 0){
		io.emit("d", {t:'king-win', d: matchRoom});
		room1KingWins = 0;
		room1Streak++;
		io.emit("d", {t:'update-1-streak', d: room1Streak});
		//clients[room1Challenger].emit("d", {t:'leave-room'});
		//var clientSocket = io.sockets.connected[room1Challenger];
		//clientSocket.leave(matchRoom);
		io.to(room1Challenger).emit("d", {t: 'leave-room'});
		var partyMembers = io.sockets.adapter.rooms[room1Challenger].sockets;
		for(var member in partyMembers){
			var clientSocket = io.sockets.connected[member];
		
		}
		if(room1Queue.length > 0){
			room1Challenger = room1Queue.shift();
		}else{
			room1Challenger = "";
		}
		UpdateChallengers(1);
      }else if(room1KingWins >= 4){
		io.emit("d", {t:'king-win', d: matchRoom});
		room1KingWins = 0;
		room1ChallengerWins = 0;
		room1Streak++;
		io.emit("d", {t:'update-1-streak', d: room1Streak});
		
		io.to(room1Challenger).emit("d", {t: 'leave-room'});
		if(io.sockets.adapter.rooms[room1Challenger] != undefined){
		var partyMembers = io.sockets.adapter.rooms[room1Challenger].sockets;
		for(var member in partyMembers){
			var clientSocket = io.sockets.connected[member];
			clientSocket.leave(matchRoom);
		}
		}
		if(room1Queue.length > 0){
			room1Challenger = room1Queue.shift();
		}else{
			room1Challenger = "";
		}
		UpdateChallengers(1);
	  }else if(room1KingWins == room1ChallengerWins){
		  io.to("room1").emit("d", {t: 'enable-buttons'});
	  }
    }else if(matchRoom == "room2"){
		room2KingWins++;
		if(room2KingWins == 2 && room2ChallengerWins == 0){
			io.emit("d", {t:'king-win', d: matchRoom});
			room2KingWins = 0;
			room2Streak++;
			io.emit("d", {t:'update-2-streak', d: room2Streak});
			
			io.to(room2Challenger).emit("d", {t: 'leave-room'});
		var partyMembers = io.sockets.adapter.rooms[room2Challenger].sockets;
		for(var member in partyMembers){
			var clientSocket = io.sockets.connected[member];
			clientSocket.leave(matchRoom);
		}
		if(room2Queue.length > 0){
			room2Challenger = room2Queue.shift();
		}else{
			room2Challenger = "";
		}
			UpdateChallengers(2);
		}else if(room2KingWins >= 4){
			io.emit("d", {t:'king-win', d: matchRoom});
			room2KingWins = 0;
			room2ChallengerWins = 0;
			room2Streak++;
			io.emit("d", {t:'update-2-streak', d: room2Streak});
			
			io.to(room2Challenger).emit("d", {t: 'leave-room'});
			if(io.sockets.adapter.rooms[room3Challenger] != undefined){
		var partyMembers = io.sockets.adapter.rooms[room2Challenger].sockets;
		for(var member in partyMembers){
			var clientSocket = io.sockets.connected[member];
			clientSocket.leave(matchRoom);
		}
			}
		if(room2Queue.length > 0){
			room2Challenger = room2Queue.shift();
		}else{
			room2Challenger = "";
		}
			UpdateChallengers(2);
		}else if(room2KingWins == room2ChallengerWins){
		  io.to("room2").emit("d", {t: 'enable-buttons'});
	  }
	}else{
		room3KingWins++;
		if(room3KingWins == 2 && room3ChallengerWins == 0){
			io.emit("d", {t:'king-win', d: matchRoom});
			room3KingWins = 0;
			room3Streak++;
			io.emit("d", {t:'update-3-streak', d: room3Streak});
			
			io.to(room3Challenger).emit("d", {t: 'leave-room'});
			if(io.sockets.adapter.rooms[room3Challenger] != undefined){
		var partyMembers = io.sockets.adapter.rooms[room3Challenger].sockets;
		for(var member in partyMembers){
			var clientSocket = io.sockets.connected[member];
			clientSocket.leave(matchRoom);
		}
			}
		if(room3Queue.length > 0){
			room3Challenger = room3Queue.shift();
		}else{
			room3Challenger = "";
		}
			UpdateChallengers(3);
		}else if(room3KingWins >= 4){
			io.emit("d", {t:'king-win', d: matchRoom});
			room3KingWins = 0;
			room3ChallengerWins = 0;
			room3Streak++;
			io.emit("d", {t:'update-3-streak', d: room3Streak});
			
			io.to(room3Challenger).emit("d", {t: 'leave-room'});
			if(io.sockets.adapter.rooms[room3Challenger] != undefined){
		var partyMembers = io.sockets.adapter.rooms[room3Challenger].sockets;
		for(var member in partyMembers){
			var clientSocket = io.sockets.connected[member];
			clientSocket.leave(matchRoom);
		}
			}
		if(room3Queue.length > 0){
			room3Challenger = room3Queue.shift();
		}else{
			room3Challenger = "";
		}
			UpdateChallengers(3);
		}else if(room3KingWins == room3ChallengerWins){
		  io.to("room3").emit("d", {t: 'enable-buttons'});
	  }
	}
  });
  
  socket.on('challenger-win', matchRoom => {
	  console.log("Challenger Win happened");
    if(matchRoom == "room1"){
      room1ChallengerWins++;
      if(room1ChallengerWins == 2 && room1KingWins == 0){
		io.emit("d", {t:'challenger-win', d: matchRoom});
		room1ChallengerWins = 0;
		room1Streak = 1;
		io.emit("d", {t:'update-1-streak', d: room1Streak});
		//clients[room1King].emit("d", {t:'leave-room'});
		io.to(room1King).emit("d", {t: 'leave-room'});
		var partyMembers = io.sockets.adapter.rooms[room1King].sockets;
		for(var member in partyMembers){
			var clientSocket = io.sockets.connected[member];
			clientSocket.leave(matchRoom);
		}
		room1King = room1Challenger;
		if(room1Queue.length > 0){
			room1Challenger = room1Queue.shift();
		}else{
			room1Challenger = "";
		}
		UpdateChallengers(1);
		UpdateKings(1);
      }else if(room1ChallengerWins >= 4){
		io.emit("d", {t:'challenger-win', d: matchRoom});
		room1ChallengerWins = 0;
		room1KingWins = 0;
		room1Streak = 1;
		io.emit("d", {t:'update-1-streak', d: room1Streak});
		
		io.to(room1King).emit("d", {t: 'leave-room'});
		if(io.sockets.adapter.rooms[room1King] != undefined){
			var partyMembers = io.sockets.adapter.rooms[room1King].sockets;
			for(var member in partyMembers){
				var clientSocket = io.sockets.connected[member];
				clientSocket.leave(matchRoom);
			}
		}
		room1King = room1Challenger;
		if(room1Queue.length > 0){
			room1Challenger = room1Queue.shift();
		}
		UpdateChallengers(1);
		UpdateKings(1);
	  }
    }else if(matchRoom == "room2"){
		room2ChallengerWins++;
      if(room2ChallengerWins == 2 && room2KingWins == 0){
		io.emit("d", {t:'challenger-win', d: matchRoom});
		room2ChallengerWins = 0;
		room2Streak = 1;
		io.emit("d", {t:'update-2-streak', d: room2Streak});
		
		io.to(room2King).emit("d", {t: 'leave-room'});
		var partyMembers = io.sockets.adapter.rooms[room2King].sockets;
		for(var member in partyMembers){
			var clientSocket = io.sockets.connected[member];
			clientSocket.leave(matchRoom);
		}
		room2King = room2Challenger;
		if(room2Queue.length > 0){
			room2Challenger = room2Queue.shift();
		}
		UpdateChallengers(2);
		UpdateKings(2);
      }else if(room2ChallengerWins >= 4){
		io.emit("d", {t:'challenger-win', d: matchRoom});
		room2ChallengerWins = 0;
		room2KingWins = 0;
		room2Streak = 1;
		io.emit("d", {t:'update-2-streak', d: room2Streak});
		
		io.to(room2King).emit("d", {t: 'leave-room'});
		if(io.sockets.adapter.rooms[room2King] != undefined){
		var partyMembers = io.sockets.adapter.rooms[room2King].sockets;
		for(var member in partyMembers){
			var clientSocket = io.sockets.connected[member];
			clientSocket.leave(matchRoom);
		}
		}
		room2King = room2Challenger;
		if(room2Queue.length > 0){
			room2Challenger = room2Queue.shift();
		}
		UpdateChallengers(2);
		UpdateKings(2);
	  }
	}else{
		room3ChallengerWins++;
      if(room3ChallengerWins == 2 && room3KingWins == 0){
		io.emit("d", {t:'challenger-win', d: matchRoom});
		room3ChallengerWins = 0;
		room3Streak = 1;
		io.emit("d", {t:'update-3-streak', d: room3Streak});
		
		io.to(room3King).emit("d", {t: 'leave-room'});
		if(io.sockets.adapter.rooms[room3King] != undefined){
		var partyMembers = io.sockets.adapter.rooms[room3King].sockets;
		for(var member in partyMembers){
			var clientSocket = io.sockets.connected[member];
			clientSocket.leave(matchRoom);
		}
		}
		room3King = room3Challenger;
		if(room3Queue.length > 0){
			room3Challenger = room3Queue.shift();
		}
		UpdateChallengers(3);
		UpdateKings(3);
      }else if(room3ChallengerWins >= 4){
		io.emit("d", {t:'challenger-win', d: matchRoom});
		room3ChallengerWins = 0;
		room3KingWins = 0;
		room3Streak = 1;
		io.emit("d", {t:'update-3-streak', d: room3Streak});
		
		io.to(room3King).emit("d", {t: 'leave-room'});
		if(io.sockets.adapter.rooms[room3King] != undefined){
		var partyMembers = io.sockets.adapter.rooms[room3King].sockets;
		for(var member in partyMembers){
			var clientSocket = io.sockets.connected[member];
			clientSocket.leave(matchRoom);
		}
		}
		room3King = room3Challenger;
		if(room3Queue.length > 0){
			room3Challenger = room3Queue.shift();
		}
		UpdateChallengers(3);
		UpdateKings(3);
	  }
	}
  });
  
  socket.on('disconnect', () => {
    if(room1Queue[socket.username]){
		delete room1Queue[socket.username];
	}else if(room2Queue[socket.username]){
		delete room2Queue[socket.username];
	}else if (room3Queue[socket.username]){
		delete room3Queue[socket.username];
	}
	else if(room1Challenger == socket.username){
		room1KingWins = 4;
		clients[room1King].emit("d", {t:'free-win'});
	}else if(room1King == socket.username){
		if(room1Challenger != ""){
		room1ChallengerWins = 4;
		clients[room1Challenger].emit("d", {t:'free-win'});
		}else{
			UpdateChallengers(1);
		UpdateKings(1);
		}
	}else if(room2Challenger == socket.username){
		room2KingWins = 4;
		clients[room2King].emit("d", {t:'free-win'});
	}else if(room2King == socket.username){
		if(room2Challenger != ""){
		room2ChallengerWins = 4;
		clients[room2Challenger].emit("d", {t:'free-win'});
		}else{
			UpdateChallengers(2);
		UpdateKings(2);
		}
	}else if(room3Challenger == socket.username){
		room3KingWins = 4;
		clients[room3King].emit("d", {t:'free-win'});
	}else if(room3King == socket.username){
		if(room3Challenger != ""){
		room3ChallengerWins = 4;
		clients[room3Challener].emit("d", {t:'free-win'});
		}else{
		UpdateChallengers(3);
		UpdateKings(3);
		}
	}
	delete clients[socket.username];
	if(rooms[socket.username]){
		delete rooms[socket.username];
	}
	
    console.log(socket.username, ' disconnected');
  });
  socket.on('party chat message', (msg) => {
    console.log("Chat started");
    var finalMessage = "";
    finalMessage = (socket.username + ': '+ msg);
    io.to(socket.roomId).emit("d", {t:'chat message', d:finalMessage});
  });
  socket.on('room1 chat message', (msg) => {
    console.log("Chat started");
    var finalMessage = "";
    finalMessage = (socket.username + ': '+ msg);
    io.to('room1').emit("d", {t:'chat message', d:finalMessage});
  });
  socket.on('room2 chat message', (msg) => {
    console.log("Chat started");
    var finalMessage = "";
    finalMessage = (socket.username + ': '+ msg);
    io.to('room2').emit("d", {t:'chat message', d:finalMessage});
  });
  socket.on('room3 chat message', (msg) => {
    console.log("Chat started");
    var finalMessage = "";
    finalMessage = (socket.username + ': '+ msg);
    io.to('room1').emit("d", {t:'chat message', d:finalMessage});
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:80');
  console.log(process.env.PORT);
});