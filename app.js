require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');

const createError = require('http-errors');

// Session middleware packages
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

//require exported routers
const indexRouter = require('./routes/index-router');
const authRouter = require('./routes/auth-router');
const siteRouter = require("./routes/site-router.js");
const cloudinaryRouter = require("./routes/cloudinary-router.js")

//stablish connection to DB
mongoose
  .connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// Express View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));


// SESSION MIDDLEWARE
// Checks incoming request: if there is a cookie, and if cookie has valid session id
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 7 * 24 * 60 * 60, // Default value - 14 days
    }),
  })
);
app.use(function (req, res, next) {
  if (req.session.currentUser) {
    res.locals.admin = req.session.currentUser
  }
  next();
})

// Checks the response if there is data on req.session
// default value for title local
app.locals.title = 'Express - Generated with express generator'; //UROS????


app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use("/", siteRouter)
app.use("/", cloudinaryRouter)


//ERROR HANDLER
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
