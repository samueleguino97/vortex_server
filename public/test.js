let socket = new WebSocket("ws://localhost:8080");
socket.addEventListener("open", () => {
  socket.send(JSON.stringify({ collection: "bis" }));
});
socket.addEventListener("message", (data) => {
  console.log(data);
});
