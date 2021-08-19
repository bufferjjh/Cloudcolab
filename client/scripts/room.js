const socket = io();
var msgStore = [];
function getTime() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today1 = mm + '/' + dd + '/' + yyyy;
  var time = "[" + today.getHours() + ":" + today.getMinutes() + ' ' + today1 + "]";
  return time;
}

function appendUser(user) {
  var userArea = document.getElementById("inRoom");
  var newUserDiv = document.createElement("div");
  newUserDiv.setAttribute("class", "userDiv");
  newUserDiv.innerHTML = user;
  userArea.appendChild(newUserDiv);
}

function userConnect(user) {
  var msg_area = document.getElementById("messaging_area");
  var msg = document.createElement('div');
  msg.className = 'userMessage';
  msg.innerHTML = "<center><a style='color:#4cfca1'>" + user + " has connected to the room" + "</a></center>";
  msg_area.appendChild(msg);
  msg.scrollIntoView();
}
function userDisconnect(user) {
  var msg_area = document.getElementById("messaging_area");
  var msg = document.createElement('div');
  msg.className = 'userMessage';
  msg.innerHTML = "<center><a style='color:#f55e53'>" + user + " has disconnected from the room" + "</a></center>";
  msg_area.appendChild(msg);
  msg.scrollIntoView();
}
document.getElementById("msg_box").addEventListener("keyup", function(event) {
  if(event.keyCode === 13) {
    event.preventDefault();
    message();
  }
});
function updateInfo(admin, topic, code) {
  document.getElementById("admin").innerHTML = "Admin: " + "<a style='color:#03d7fc'>" + admin + "</a>";
  document.getElementById("topic").innerHTML = topic;
  document.getElementById("roomcode").innerHTML = "Code: " + "<a style='color:#03d7fc'>" + code + "</a>";
}

function updateCount(count) {
  document.getElementById("users_online").innerHTML = "Room Users: " + count;
}

socket.on("update-room-count", count => {
  updateCount(count);
  console.log("hi");
});

//attempt to get environment vars, if fail, redirect to index, roomcode and username
var roomkey = localStorage.getItem("roomkey");
var username = localStorage.getItem("username");
var isAdmin = localStorage.getItem("is_admin");

//clear keys

function appendMSG(user, Umsg) {
  var date = getTime();
  var msg_area = document.getElementById("messaging_area");
  var msg = document.createElement('div');
  msg.className = 'userMessage';
  msg.innerHTML = "<a style='color:#4cfca1'>" + user + "</a>" +  " " + date + "<br>" + "<center style='color: white'>" + Umsg + "</center>";
  msg_area.appendChild(msg);
  msg.scrollIntoView();
  if(user == "You") {
    msgStore.push(date + " : " + username + ": " + Umsg);
  }
  else {
    msgStore.push(date + " : " + user + ": " + Umsg);
  }
}

console.log(roomkey + " " + username);
if(roomkey == null || username == null) {
  window.location.href = "index.html";
}
if(username == "") {
  username = "Anonymous";
}
else {
  //send request to get server data
  socket.emit("room-data-req", roomkey);
  var msg_area = document.getElementById("messaging_area");
  var msg = document.createElement('div');
  msg.className = 'userMessage';
  msg.innerHTML = "<center><a style='color:#4cfca1'>" + "You" + " have connected to the room" + "</a></center>";
  msg_area.appendChild(msg);
}
localStorage.removeItem("roomkey");
localStorage.removeItem("username");
localStorage.removeItem("is_admin");
socket.on("invalid-key", () => {
  alert("asasds");
  window.location.href = "index.html";
});

function deleteUsers() {
  var divs = document.getElementsByClassName('userDiv');
  while(divs.length > 0) {
    divs[0].remove();
  }
}

socket.on("update-connected", data => {
  deleteUsers();
  for (var i in data) {
    appendUser(data[i]);
  }
});
var roomTitle;
socket.on("valid-key", data => {
  console.log(data);
  updateInfo(data[0], data[1], roomkey);
  socket.emit("room-join", [roomkey, username]);
  updateCount(data[2] + 1);
  roomTitle = data[1];
});
socket.on("join-complete", () => {
  socket.emit("userConn-req", roomkey);
});
socket.on("message-recieve", data => {
  appendMSG(data[0], data[1]);
});
socket.on("user-joined", user => {
  userConnect(user);
});
function promptFunction() {
  window.location.href = "index.html";
}
socket.on("room-closed", () => {
  throwMSG("Room Closed By Admin", "Home");
  console.log("fuck");
});
socket.on("user-disconnected", user=> {
  userDisconnect(user);
})
if(isAdmin) {
  console.log("is admin");
  socket.emit("admin_reg", roomkey);
  //create close room button
  var close_button = document.createElement('input');
  close_button.type = "button";
  close_button.setAttribute('id', "close_room");
  close_button.setAttribute('onclick', "socket.emit('room-msg-data', [msgStore, username, roomTitle, getTime()]); window.location.href='index.html';");
  close_button.value = "Close Room";
  var topBar = document.getElementById("top_bar");
  topBar.appendChild(close_button);
}
function message() {
  //emit message to server
  var currMSG = document.getElementById("msg_box").value;
  if(currMSG != "") {
    appendMSG("You", currMSG);
    document.getElementById("msg_box").value = "";
    socket.emit("user-message", [roomkey, username, currMSG]);
  }
}

function saveChat() {
  var content = "";
  for (var i = 0; i < msgStore.length; i++) {
    content += msgStore[i] + "\n";
  }
  var filename = "chatroom.txt";
  var element = document.getElementById("downloadBtn");
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', filename);
}

var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
var textDiv = document.getElementById("msg_box");
var rec = false;
var btn = document.getElementById("voiceDiv");

function startRec() {
  btn.style.backgroundColor = "red";
  recognition.start();
  var Final = '';

  recognition.onresult = function(e) {
    var interim = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      var transcript = e.results[i][0].transcript;
      if(e.results[i].isFinal) {
        Final += transcript;
      }
      else {
        interim += transcript;
      }
      textDiv.value = Final + interim;
    }
  }
}
function stopRec() {
  btn.style.backgroundColor = "green";
  recognition.stop();
}

function rec_click() {
  if(rec) {
    stopRec();
    rec = false;
  }
  else {
    startRec();
    rec = true;
  }
}
