const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.config');
const http = require('http');
const { Server } = require('socket.io');
const authRouter = require('./route/user.route');
const noteRouter = require('./route/note.route');
const { verifyToken } = require('./utils/jwt.utils');
const app = express();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ["GET", "POST"] } });

connectDB();

const PORT = process.env.PORT || 8000;
app.set('io', io);
app.use(cors());
app.use(express.json());

global.io = io;

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
  try {
    if (!token) {
      return next(new Error('unauthorized'));
    }
    const payload = verifyToken(token);
    socket.userId = payload?.id;
    return next();
  } catch (err) {
    return next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  socket.on('join-note', ({ noteId }) => {
    socket.join(`note:${noteId}`);
    console.log(`User ${socket.userId} joined room note:${noteId}`);
  });

  socket.on('leave-note', ({ noteId }) => {
    socket.leave(noteId);
    console.log(`User ${socket.userId} left note ${noteId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

app.use('/api/auth', authRouter);
app.use('/api/note', noteRouter);

app.get('/', (req, res) => {
  res.send('Hello Mr. User.....,');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ......`);
});

module.exports = { io }