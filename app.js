const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const { ensureAuthenticated } = require("./helpers/auth");
const bodyParser = require("body-parser");
const passport = require("passport");
const mongoose = require("mongoose");
const app = express();

// Load routes
const users = require("./routes/users");
const ideas = require("./routes/ideas");
const auth = require("./routes/auth");

// Passport Config
require("./config/passport")(passport);
// DB Config
const db = require("./config/database");

// Map global promise -get rid of warning
mongoose.Promise = global.Promise;
//Connect to mongoose
mongoose
  .connect(db.mongoURI, {
    useNewUrlParser: true
  })

  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

//Handlebars Middleware
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

//Body Parser Middleware (you can with this access the body)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Method override middleware with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// Middleware For Express Session and connect flash
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global Variables (video 24)
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// How Middleware Works
app.use(function(req, res, next) {
  //console.log(Date.now());
  req.name = "Femi Aremu";
  next();
});

// Index route
app.get("/", (req, res) => {
  const title = "Protegee";
  res.render("index", {
    title: title
  });
});

//Ideas Page/ Dashboard
app.get("/ideas/add", (req, res) => {
  res.render("ideas/add");
});

app.get("/about", (req, res) => {
  res.render("about");
});

//About Page

//User Login Route
//app.get('/', (req, res) => {
//  console.log('Mee');
// res.send('login');
//});

app.post("/", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/ideas",
    failureRedirect: "/",
    failureFlash: true
  })(req, res, next);
});

// Use Routes
app.use("/ideas", ideas);
app.use("/users", users);
app.use("/auth", auth);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server Started on ${port}`);
  // console.log('Server Started on port' + port);
});
