const socket = io();
function setCode(code) {
  localStorage.setItem("presetCode", code);
  window.location.href = "join.html";
}
function appendEvent(code1, admin, title2, active) {
  var area = document.getElementById("active_games");
  var msg_div = document.createElement('div');
  msg_div.id = code1;
  msg_div.setAttribute("class", "activeChatSession");
  var starter = document.createElement('p');
  starter.innerHTML = "<center><a style='color: white'>" + admin + ": " + "</a>" + "<a style='color: #07fa17'>" + code1 + "</a></center>";
  msg_div.appendChild(starter);
  msg_div.appendChild(document.createElement('br'));
  var title1 = document.createElement("p");
  title1.innerHTML = title2;
  title1.setAttribute("style", "color: white");
  msg_div.appendChild(title1);
  msg_div.appendChild(document.createElement('br'));
  var activeUsers = document.createElement("p");
  activeUsers.innerHTML = "• " + active + " Users";
  activeUsers.setAttribute("style", "color: #07fa28");
  msg_div.appendChild(activeUsers);
  msg_div.setAttribute("onclick", "setCode(this.id)");
  area.appendChild(msg_div);
}
function appendFiller() {
  var fillBlock = document.createElement("div");
  fillBlock.setAttribute("class", 'fillerblock');
  var area = document.getElementById("active_games");
  area.appendChild(fillBlock);
}

socket.emit("index-connect");
//gets all active games in return
socket.on("index-res", data => {
  obj_keys = Object.keys(data);
  for (var i = 0; i < obj_keys.length; i++) {
    var curr = data[obj_keys[i]];
    var currCode = obj_keys[i];
    appendEvent(currCode, curr[0], curr[1], curr[2]);
  }
  document.getElementById("numGames").innerHTML = "⦿ " + obj_keys.length + " active rooms";

  if(obj_keys.length < 3) {
    for (var i = 0; i < 3 - obj_keys.length; i++) {
      appendFiller();
    }
  }
});

function refresh_display() {
  window.location.href = "index.html";
}
