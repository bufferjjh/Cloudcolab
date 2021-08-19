var PORT = process.env.PORT || 5000;
var express = require('express');
var app = express();
var fs = require('fs');
var http = require('http');
var server = http.Server(app);
app.use(express.static('client'));
server.listen(PORT, function() {
  console.log('server running');
});
const io = require('socket.io')(server)

const rooms = {}
const admins = {}
const clients = {}
var recentRooms = [];
function generate_key() {
  var curr = Math.floor(Math.random() * (1000000)) + 10000;
  var key = curr.toString();
  var exists = key in rooms;
  if(exists == false) {
    return key;
  }
  else {
    generate_key();
  }
}

//room structure : key : [admin, topic]
//admin structure : admin(id) : key

io.on('connection', socket => {
  socket.on("room-created", data => {
    var game_key = generate_key();
    rooms[game_key] = data;
    socket.emit("success", game_key);
  });
  socket.on("room-data-req", key => {
    var exists = key in rooms;
    if(exists == false) {
      socket.emit("invalid-key");
    }
    else {
      socket.emit("valid-key", rooms[key]);
    }
  });
  socket.on("room-join", data => {
    if(data[0] in rooms) {
      socket.join(data[0]);
      socket.emit("join-complete");
      clients[socket.id] = data[1];
      socket.to(data[0]).emit("user-joined", data[1]);
      rooms[data[0]][2] = rooms[data[0]][2] + 1;
      socket.to(data[0]).emit("update-room-count", rooms[data[0]][2]);

      var socketIDS = Object.keys(io.sockets.adapter.rooms[data[0]].sockets);
      var usernames = []
      for (var i in socketIDS) {
        if(socketIDS[i] in clients) {
          usernames.push(clients[socketIDS[i]]);
        }
      }
      socket.to(data[0]).emit("update-connected", usernames);
    }
    else {
      socket.emit("invalid-key");
    }
  });
  socket.on("admin_reg", code => {
    admins[socket.id] = code;
  });
  socket.on("disconnecting", () => {
    var connect_rooms = Object.keys(socket.rooms).filter(item => item!=socket.id);
    var conns = []
    for (var i = 0; i < connect_rooms.length; i++) {
  //decrement one from the room with the keys
      if(connect_rooms[i] in rooms) {
        conns.push(connect_rooms[i]);
        rooms[connect_rooms[i]][2] = rooms[connect_rooms[i]][2] - 1;
        socket.to(connect_rooms[i]).emit("update-room-count", rooms[connect_rooms[i]][2]);

        if(socket.id in clients) {
          socket.to(connect_rooms[i]).emit("user-disconnected", clients[socket.id]);
          delete clients[socket.id];
        }
      }
    }
    if(socket.id in admins) {
      socket.to(admins[socket.id]).emit("room-closed");
      if(admins[socket.id] in rooms) {
        delete rooms[admins[socket.id]];
      }
      delete admins[socket.id];
    }
    else {
      //send to room all connected clients
      if(conns.length != 0) {
        var socketIDS = Object.keys(io.sockets.adapter.rooms[conns[0]].sockets);
        var usernames = []
        for (var i in socketIDS) {
          if(socketIDS[i] in clients && socketIDS[i] != socket.id) {
            usernames.push(clients[socketIDS[i]]);
          }
        }
        socket.to(conns[0]).emit("update-connected", usernames);
      }
    }
  });
  socket.on("is-valid", key => {
    if(key in rooms) {
      socket.emit("good");
    }
    else {
      socket.emit("bad");
    }
  });
  socket.on("user-message", data => {
    socket.to(data[0]).emit("message-recieve",[data[1], data[2]]);
  });
  socket.on("index-connect", () => {
    socket.emit("index-res", rooms);
  });
  socket.on("userConn-req", key => {
    var socketIDS = Object.keys(io.sockets.adapter.rooms[key].sockets);
    var usernames = []
    for (var i in socketIDS) {
      if(socketIDS[i] in clients) {
        usernames.push(clients[socketIDS[i]]);
      }
    }
    socket.emit("update-connected", usernames);
  });

  socket.on("room-msg-data", data => {
    if(recentRooms.length >= 9) {
      recentRooms.shift();
    }
    recentRooms.push(data);
  });
  socket.on("recent-connect", () => {
    socket.emit("recent-response", recentRooms);
  });
  socket.on("chat-history-req", i => {
    if(i >= 0 && i < recentRooms.length) {
      socket.emit("chat-history-res", recentRooms[i]);
    }
    else {
      socket.emit("invalid-chat-req");
    }
  });
});
