const socket = io();
function attempt_create() {
  var username = document.getElementById("username").value;
  var topic = document.getElementById("topic").value;
  socket.emit("room-created", [username, topic,0]);
  //wait for assigned key
}

socket.on("success", key => {
  localStorage.setItem("roomkey", key);
  localStorage.setItem("username", document.getElementById("username").value);
  localStorage.setItem("is_admin", true);
  window.location.href = "room.html";
});
