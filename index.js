const express = require("express");
const cors = require("cors");
const cookiesParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/connectDB");
const router = require("./routes/index");

// from socket.io connection
const { app, server } = require("./socket/index");

// const app = express(); // this is our express connection BEFORE WE CONNECTED SOCKET.IO. NOW, WE ARE USING THE app THAT WE required from /socket.io
// data will only be allowed from the FRONTEND_URL coming to the server
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);

app.use(express.json());

app.use(cookiesParser());

const PORT = process.env.PORT || 8080;

app.get("/", (request, response) => {
  response.json({
    message: "Server running at " + PORT
  });
});

// API end-points
app.use("/api", router);

connectDB().then(() => {
  // This is how we are listening to the app before we required the server from socket.io/ This is our connection before we installed socket.io and connected it
  // app.listen(PORT, () => {
  //   console.log("server running at " + PORT);
  // });
  server.listen(PORT, () => {
    console.log("server running at " + PORT);
  });
});
