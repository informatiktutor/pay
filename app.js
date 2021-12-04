var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var compression = require('compression');
var session = require('express-session');

require('dotenv').config();

var database = require("./lib/database");
database.create();

var app = express();

const routers = {
  index: require('./routes/index'),
  login: require('./routes/login'),
  logout: require('./routes/logout'),
  dashboard: require('./routes/dashboard'),
  new: require('./routes/new')
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
if (app.get('env') === 'development') {
  app.disable('view cache');
  app.set('view options', {cache: false});
}

app.use(compression());
app.use(session({
  secret: 'secret', // FIXME
  resave: true,
  saveUninitialized: true
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false,
  sourceMap: app.get('env') === 'development'
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/favicon.ico', (req, res) => {
  res.sendStatus(404);
});

app.use('/login', routers.login);
app.use('/logout', routers.logout);
app.use('/dashboard', routers.dashboard);
app.use('/new', routers.new);
app.use('/', routers.index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
