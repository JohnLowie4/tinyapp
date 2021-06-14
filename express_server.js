const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { urlsForUser, generateRandomString, getUserByEmail,userExist } = require("./helpers");
const app = express();
const salt = 10;
const PORT = 8080;  // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',  // this can be anything
  keys: ['key1', 'key2']
}));

/********** Databases **********/

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "helloWorld"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$uoK7WelneRYAlskqRBYjJOUYVXdpIFci9mAizfRNNNE27DtN/xGlS"
    // hello
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$quoclAqZjI35BYc/aD1fWeYD3e6sFSgwRWff2dT110z4tKi6FTAR6"
    // dishwasher-funk
  },
  "helloWorld": {
    id: "helloWorld",
    email: "hello@world.ca",
    password: "$2a$10$7wOIx7gKj1ZQpSdstJhEDOHp5ptj9gtI0aVrbuqjI6r3mVEpuIenO"
    // qwerty
  }
};

/********** Get Methods **********/

// Redirects to home page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// Home page
app.get("/urls", (req, res) => {
  let user = {};
  let userURL = {};

  // Checks if user is logged in
  const cookie = req.session.user_id;
  if (users[cookie]) {
    user = users[cookie];
    userURL = urlsForUser(user.id, urlDatabase);
  }

  const templateVars = {
    user,
    userURL,
  };
  
  res.render("urls_index", templateVars);
});

// Create new short url
app.get("/urls/new", (req, res) => {
  let user = {};

  // Checks if user exists
  const cookie = req.session.user_id;
  user = userExist(cookie, users);

  const templateVars = { user };

  // Checks if user is logged in
  if (!cookie) {
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let user = {};
  const shortURL = req.params.id;

  // Checks if user exists
  const cookie = req.session.user_id;
  user = userExist(cookie, users);

  let longURL = req.body.longURL;
  
  // Checks if user has an id
  if (Object.keys(user) !== 0) {
    // Checks if user is linked to their own url
    if (user.id === urlDatabase[shortURL].userID) {
      longURL = urlDatabase[shortURL].longURL;
    } else if (!urlDatabase[shortURL].userID) {
      longURL = urlDatabase[shortURL].longURL;
      urlDatabase[shortURL].userID = user.id;
    }
  }

  const templateVars = {
    user,
    shortURL,
    longURL
  };

  res.render("urls_show", templateVars);
});

// Redirects to long url
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Page not found");
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// Register page
app.get("/register", (req, res) => {
  let user = {};

  const cookie = req.session.user_id;
  // If user is logged in then it redirects to home page
  // if (cookie) {
  //   return res.redirect("/urls");
  // }

  // Checks if user exists
  user = userExist(cookie, users);

  const templateVars = { user };

  res.render("register", templateVars);
});

// Login page
app.get("/login", (req, res) => {
  let user = {};

  const cookie = req.session.user_id;
  // If user is logged in then it redirects to home page
  // if (cookie) {
  //   return res.redirect("/urls");
  // }

  // Checks if user exists
  user = userExist(cookie, users);

  const templateVars = { user };

  res.render("login", templateVars);
});

/********** Post Methods **********/

// Creates new url
app.post("/urls", (req, res) => {
  let newID = generateRandomString();
  // Updates database
  urlDatabase[newID] = {
    longURL: req.body.longURL,
    userID: ""
  };
  
  res.redirect(`/urls/${newID}`);
});

// Deletes short url
app.post("/urls/:id/delete", (req, res) => {
  // Checks if user is logged in
  if (!req.session.user_id) {
    return res.status(403).send("You do not have permission to delete this URL");
  }
  // Deletes the url from database
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  // Checks if user is logged in
  if (!req.session.user_id) {
    return res.redirect("/urls");
  }
  
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});

// Registers user
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, salt);

  // Checks if email and passwords are invalid
  if (!req.body.password || !email) {
    return res.status(400).send("You must enter a valid email and/or password");
  }

  // Checks if user exists in database
  if (getUserByEmail(email, users)) {
    return res.status(400).send("This user already exist");
  }

  users[id] = { id, email, password };

  // Create new encrypted cookie id
  req.session.user_id = id;
  res.redirect("/urls");
});

/********** POST Method Login/Logout **********/

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  // These next few lines of code is from W03D3 zoom video
  let foundUser;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }

  // Checks if email is in database
  if (!getUserByEmail(email, users)) {
    return res.status(403).send("Cannot find user with that email");
  }

  // Checks if password is correct
  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(403).send("Password is incorrect");
  }

  req.session.user_id = foundUser.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // Destroys cookie session
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});