const socket = io();
var preCode = localStorage.getItem("presetCode");
if(preCode != null) {
  document.getElementById("roomcode").value = preCode;
}
function attempt_join() {
  var username = document.getElementById("username").value;
  var roomcode = document.getElementById("roomcode").value;
  socket.emit("is-valid", roomcode);
}
function promptFunction() {
  //delete the msg prompt, delete shadeDiv
  var msgBox = document.getElementById("shade_div");
  var msgPrompt = document.getElementById("prompt_div");
  msgPrompt.remove();
  msgBox.remove();
}
socket.on("good", () => {
  localStorage.setItem("roomkey", document.getElementById("roomcode").value);
  localStorage.setItem("username", document.getElementById("username").value);
  window.location.href = "room.html";
});
socket.on("bad", () => {
  throwMSG("Invalid Key", "Close");
});
