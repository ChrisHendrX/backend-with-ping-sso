const createError = require('http-errors');
const express = require('express');
// const { Issuer } = require('openid-client');
const session = require('express-session');
const logger = require('morgan');
const passport = require('passport');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const oidcMiddleware = require('./middlewares/oidc');
const authRouter = require('./routes/auth');
const protectedRouter = require('./routes/protected');

const app = express();

app.use(session({ secret: 'sessionSecret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  done(null, user)
});
passport.deserializeUser((user, done) => {
  done(null, user)
});

// app.use(oidcMiddleware);

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
  // if (isDevelopment) console.log('error', response.locals);
  response.status(error.status || 500);
  response.json(error);
});



module.exports = app;