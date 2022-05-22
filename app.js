const express = require("express");
const cors = require("cors");

const loggedDataRouter = require("./routes/loggedDataRoute");
const questionsRouter = require("./routes/questionsRoute");
const usersRouter = require("./routes/usersRoute");

const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

const sessionSecret = "make a secret string";

const store = MongoStore.create({
  mongoUrl: uri,
  secret: sessionSecret,
  touchAfter: 24 * 60 * 60,
});

const sessionConfig = {
  store,
  name: "session",
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    path: "/",
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    // later you would want to add: 'secure: true' once your website is hosted on HTTPS.
  },
};

// This is middleware that will run before every request
app.use((req, res, next) => {
  // We can set variables on the request, which we can then access in a future method
  req.requestTime = Date.now();
  // Calling next() makes it go to the next function that will handle the request
  next();
});

app.use(session(sessionConfig));

app.use("/api", loggedDataRouter);
app.use("/api", questionsRouter);
app.use("/api", usersRouter);

app.use((err, req, res, next) => {
  console.log("Error handling called " + err);
  // If want to print out the error stack, uncomment below
  // console.error(err.stack)
  // Updating the statusMessage with our custom error message (otherwise it will have a default for the status code).
  res.statusMessage = err.message;

  if (err.name === "ValidationError") {
    res.status(400).end();
  } else if (err.name === "MongoServerError") {
    //unable to manipulate mongoDB
    res.status(501).end();
  } else {
    // We could further interpret the errors to send a specific status based more error types.
    res.status(500).end();
  }
});

module.exports = app;
