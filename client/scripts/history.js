const socket = io();

var index = localStorage.getItem("chat-history-id");

if(index == null) {window.location.href = "recent.html";}
else {socket.emit("chat-history-req", parseInt(index));}

socket.on("invalid-chat-req", () => {
  window.location.href = "recent.html";
});

function splitter(msg) {
  var parts = msg.split(":");
    console.log(parts);
  return [parts[2], parts[3]];
}
var MSG;

var msgArea = document.getElementById("msgArea");
function appendMSG(user, Umsg) {
  var msg = document.createElement('div');
  msg.className = 'userMessage';
  msg.innerHTML = "<a style='color:#4cfca1'>" + user + "</a>" +  " " + "<br>" + "<center style='color: white'>" + Umsg + "</center>";
  msgArea.appendChild(msg);
}
var RT;
socket.on("chat-history-res", data => {
  //sub in fields
  var admin = data[1];
  var messages = data[0];
  var roomTitle = data[2];
  RT = roomTitle;
  MSG = data[0];
  document.getElementById("admin").innerHTML = "<a style='color: white'>Admin: </a>" + "<a style='color: #42b3f5'>" + admin + "</a>";
  document.getElementById("room_title").innerHTML = roomTitle;
  for (var i = 0; i < data[0].length; i++) {
    var sep = splitter(data[0][i]);
    appendMSG(sep[0], sep[1]);
  }
});

function downloadChat() {
  var content = "";
  for (var i = 0; i < MSG.length; i++) {
    content += MSG[i] + "\n";
  }
  console.log(content);
  var filename = RT + ".txt";
  var element = document.getElementById("downloadBtn");
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', filename);
}
