const express = require('express');

const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const users = []; 

io.on('connection', (socket) => {
    
    socket.broadcast.emit('connect-disconnect', `A user connected.`);
    socket.emit('connect-disconnect',  `${users.length} user(s) in the chatroom.`);
    io.emit("users", users);

    socket.on('username', (username) => {
      if(users.includes(username)) {
        console.log("username taken") //handled on client, shouldnt happen
        return;
      }
      socket.username = username;

      users.push( {username, id: socket.id} );
      socket.emit('connect-disconnect', `Welcome ${socket.username}`);
      socket.broadcast.emit('connect-disconnect', `Say hi to ${socket.username}`);
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', socket.username, msg);
      });

    socket.on('disconnect', () => {
      
      const index = users.findIndex( user => user.id === socket.id  );
      if(index > -1) { users.splice(index, 1); }

      socket.broadcast.emit('connect-disconnect', `${socket.username} disconnected. ${users.length} user(s) in the chatroom.`);
    });
  });
  

server.listen(3000, () => {
  console.log('listening on *:3000');
});