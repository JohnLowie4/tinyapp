const express = require("express");
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { urlsForUser, generateRandomString, getUserByEmail } = require("./helpers");
const app = express();
const salt = 10;
const PORT = 8080;  // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',  // this can be anything
  keys: ['key1', 'key2']
}))

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
}

/********** Get Methods **********/

app.get("/urls", (req, res) => {
  let user = {};
  let userURL = {};

  if (users[req.session.user_id]) {
    user = users[req.session.user_id];
    userURL = urlsForUser(user.id, urlDatabase);
  }
  
  const templateVars = {
    user,
    userURL,
  };
  console.log(user);
  console.log(userURL);

  // console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let user = {};
  if (users[req.session.user_id]) {
    user = users[req.session.user_id];
  }
  const templateVars = {
    user
  }
  // console.log(req.session.user_id);
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let user = {};
  const shortURL = req.params.shortURL;
  if (users[req.session.user_id]) {
    user = users[req.session.user_id];
  }
  let longURL = req.body.longURL;
  if (Object.keys(user) !== 0) {
    if (user.id === urlDatabase[req.params.shortURL].userID) {
      longURL = urlDatabase[req.params.shortURL].longURL;
    } else if (!urlDatabase[req.params.shortURL].userID) {
      longURL = urlDatabase[req.params.shortURL].longURL;
      urlDatabase[req.params.shortURL].userID = user.id;
    }
  }

  const templateVars = { 
    user,
    shortURL,
    longURL
  };
  // console.log(urlDatabase);
  // console.log(templateVars.longURL);
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  // console.log(longURL);
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let user = {};
  if (users[req.session.user_id]) {
    user = users[req.session.user_id];
  }
  const templateVars = {
    user
  }
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let user = {};
  if (users[req.session.user_id]) {
    user = users[req.session.user_id];
  }
  const templateVars = {
    user
  }
  res.render("login", templateVars);
});

/********** Post Methods **********/

app.post("/urls", (req, res) => {
  // console.log(req.body);
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID: ""
  };
  // console.log(urlDatabase);
  res.redirect(`/urls/${newShortURL}`);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    // console.log(urlDatabase);
    return res.redirect("/urls");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    // console.log(urlDatabase);
    return res.redirect("/urls");
  }
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  // console.log(req.body);
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, salt);

  if (!password || !email) {
    return res.status(400).send("You must enter a valid email and/or password");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("This user already exist");
  }

  users[id] = { id, email, password };

  // res.cookie("user_id", id);
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

  if (!getUserByEmail(email, users)) {
    return res.status(403).send("Cannot find user with that email");
  }

  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(403).send("Password is incorrect");
  }

  // res.cookie("user_id", foundUser.id);
  req.session.user_id = foundUser.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});