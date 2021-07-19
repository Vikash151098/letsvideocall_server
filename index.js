const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// app.get("/", (req, res) => {
//   res.send("server is running...");
// });

io.on("connection", (socket) => {
  socket.on("chat_messages", ({ from, to, msg }) => {
    io.to(to).emit("chat_messages", { from, msg });
  });

  socket.emit("me", socket.id);
  // console.log("a user is connected with socket id", socket.id);

  socket.on("disconnect", () => {
    // console.log("use disconnect with socket id", socket.id);
    socket.broadcast.emit("callended");
  });

  socket.on("calluser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("calluser", { signal: signalData, from, name });
    console.log("calluser called");
  });

  socket.on("answercall", (data) => {
    io.to(data.to).emit("callaccepted", data.signal);
    console.log("answercall called");
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
