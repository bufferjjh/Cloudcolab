//event : admin, topic, # messages, time closed
const socket = io();

function goToChat(i) {
  localStorage.setItem("chat-history-id", i);
  window.location.href = "history.html";
}
function appendFiller() {
  var filler = document.createElement("div");
  filler.setAttribute("class", "fillerblock");
  document.getElementById("rooms_display").appendChild(filler);
}
function appendEvent(admin, topic, num_msg, time_closed, index) {
  var event = document.createElement("div");
  event.setAttribute("class", "recentChatSession");
  event.setAttribute("id", index.toString());
  var adminName = document.createElement("p");
  adminName.innerHTML = "<center>"+"Admin: " + admin + "</center>";
  adminName.style.color = "white";
  event.appendChild(adminName);
  event.appendChild(document.createElement("br"));
  var roomTopic = document.createElement("p");
  roomTopic.innerHTML = "<center>" + topic + "</center>";
  roomTopic.style.color = "#e69d73";
  event.appendChild(roomTopic);
  event.appendChild(document.createElement("br"));
  var numMSG = document.createElement("p");
  numMSG.innerHTML = num_msg + " Messages";
  numMSG.style.color = "#34eb7d";
  event.appendChild(numMSG);
  event.appendChild(document.createElement("br"));
  var closedTime = document.createElement("p");
  closedTime.innerHTML = "Ended: " + time_closed;
  closedTime.style.color = "orange";
  event.appendChild(closedTime);
  event.setAttribute("onclick", "goToChat(this.id)");
  document.getElementById("rooms_display").appendChild(event);
}

socket.emit("recent-connect");

socket.on("recent-response", rooms => {
  document.getElementById("numGames").innerHTML = "⦿ " +  rooms.length + " recent rooms";
  for (var i = 0; i < rooms.length; i++) {
    appendEvent(rooms[i][1], rooms[i][2], rooms[i][0].length, rooms[i][3], i);
  }
  if(rooms.length < 3) {
    for (var i = 0; i < 3 - rooms.length; i++) {appendFiller();}
  }
  console.log(rooms);
});
