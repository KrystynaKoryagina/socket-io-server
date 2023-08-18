const express = require('express');
const http = require('http');
const cors = require('cors');
const crypto = require('crypto');
const { Server } = require('socket.io');
const { ADMIN, addUser, removeUser, findUser, getRoomUsers } = require('./users');

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "*" }));

const port = 8080;

io.on('connection', (socket) => {

  /* 
    User { name: string; role: UserRole; userId: string; room: string }
    Message { id: string; message: string; user: User }
  */

  socket.on('join', (user) => {
    const { name, room } = user
  
    socket.join(room);
    const isUserExist = !!findUser(user);

    addUser(user);
  
    const welcomeMsg = isUserExist ? `${name}, here you go again` : `${name}, welcome to the room`;

    socket.emit('message', {
      data: { id: crypto.randomUUID(), message: welcomeMsg, user: ADMIN }
    })

    socket.broadcast.to(room).emit('message', {
      data: { id: crypto.randomUUID(), message: `${name} joined the room`, user: ADMIN }
    });

    io.to(room).emit('room', { data: getRoomUsers(room) });
  });

  socket.on('sendMessage', (data) => {
    const { user, message } = data;

    if (user) {
      io.to(user.room).emit('message', {
        data: { id: crypto.randomUUID(), message, user: user }
      });
    }
  })

  socket.on('leaveRoom', (user) => {
    const userToRemove = findUser(user);

    if (userToRemove) {
      const { room, name } = userToRemove;

      removeUser(userToRemove);

      io.to(room).emit('message', {
        data: { id: crypto.randomUUID(), message: `${name} left the room`, user: ADMIN }
      });
  
      io.to(room).emit('room', { data: getRoomUsers(room) });
    }
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} user disconnected`);
  });
});


server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})