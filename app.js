const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const { cookieOptions } = require('./configuration');
const authRouter = require('./routes/auth');
const protectedRouter = require('./routes/protected');

const app = express();

const corsOptions = { origin: process.env.FRONT_END_BASE_URL, credentials: true };

app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/v1', protectedRouter);

// Catch 404 and forward to error handler
app.use((request, response, next) => {
  next(createError(404));
});

// error handler
app.use((error, request, response, next) => {
  const isDevelopment = request.app.get('env') === 'development';
  response.locals.message = error.message;
  response.locals.error = isDevelopment ? error : {};
  if (isDevelopment) console.log('error', response.locals);
  response.status(error.status || 500);
  response.json(error);
});



module.exports = app;