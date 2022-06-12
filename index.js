/*jslint node: true */
// jshint esversion:8
'use strict';

const {
  Server
} = require('socket.io');
const {
  createServer
} = require('http');
const fs = require('fs');
const config = require('./configs/config');
const path = require('path');

global.logger = require('./logger');
global.helper = require('./utils/helper');

logger.info('Logger is ready');

const app = require('./configs/express');

const options = {
  key: fs.readFileSync(path.resolve(config.server_key)),
  cert: fs.readFileSync(path.resolve(config.server_cert)),
};
// create express app using http server
const server = createServer(options, app);

/** Create socket connection */

global.io = new Server(server, {
  cors: {
    origin: '*',
  },
  serveClient: false,
});

let users = [];

global.io.on('connection', (client) => {
  logger.info('connected', client.id);
  // event fired when the chat room is disconnected
  client.on('disconnect', () => {
    logger.warn('disconnect', users);
    users = users.filter((user) => user.socketId !== client.id);
  });

  // add identity of user mapped to the socket id
  client.on('identity', (userId) => {
    users.push({
      socketId: client.id,
      userId: userId,
    });

    logger.info('identity', users);
  });

  // subscribe person to chat & other user as well
  client.on('subscribe', (roomId, otherUserId = '') => {
    logger.info('subscribe', [roomId, otherUserId, users]);
    client.join(roomId);
  });

  // mute a chat room
  client.on('unsubscribe', (roomId) => {
    client.leave(roomId);
  });
});

const port = app.get('port');
server.listen(port, () => {
  logger.info(`Server started on port ${port} 🚀`);
});
