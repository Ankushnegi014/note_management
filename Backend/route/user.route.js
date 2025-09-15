const express = require('express');
const authRouter = express.Router();

const { registerUser, loginUser, getCurrentUser } = require('../controller/user.controller');
const { protect } = require('../middleware/auth.middleware.js');

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.get('/current-user', protect, getCurrentUser);

module.exports = authRouter;