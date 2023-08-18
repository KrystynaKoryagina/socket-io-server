const crypto = require('crypto');

/* User { name: string; role: UserRole; userId: string; room: string } */
const ADMIN = {
  userId: crypto.randomUUID(),
  name: 'Admin',
  role: 'ADMIN',
}

let users = [];

const findUser = (user) => {
  return users.find((item) => item.userId === user.userId && item.room === user.room);
};

const getRoomUsers = (room) => users.filter((user) => user.room === room);

const addUser = (user) => {
  if (!!findUser(user)) {
    return;
  }

  users.push(user);
};

const removeUser = (user) => {
  const userIdx = users.findIndex((item) => item.userId === user.userId && item.room === user.room);

  users.splice(userIdx, 1);
}

module.exports = { ADMIN, addUser, removeUser, findUser, getRoomUsers };
