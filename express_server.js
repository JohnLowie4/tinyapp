const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;  // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const generateRandomString = () => {
  const alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
  let ret = "";
  for (let i = 1; i <= 6; i++) {
    let randNum = Math.floor(Math.random() * alphanumeric.length);
    ret += alphanumeric[randNum];
  }
  return ret;
};

// Checks if user already exists for POST /register
const checkUserExist = (userEmail) => {
  for (const user in users) {
    if (users[user].email === userEmail) {
      return true;
    }
  }
  return false;
};

/********** Get Methods **********/

app.get("/urls", (req, res) => {
  let user = {};
  if (users[req.cookies["user_id"]]) {
    user = users[req.cookies["user_id"]];
  }
  const templateVars = {
    user,
    urls: urlDatabase
  };
  // console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let user = {};
  if (users[req.cookies["user_id"]]) {
    user = users[req.cookies["user_id"]];
  }
  const templateVars = {
    user
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let user = {};
  if (users[req.cookies["user_id"]]) {
    user = users[req.cookies["user_id"]];
  }
  const templateVars = { 
    users,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  // console.log(templateVars);
  // console.log(templateVars.longURL);
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // console.log(longURL);
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let user = {};
  if (users[req.cookies["user_id"]]) {
    user = users[req.cookies["user_id"]];
  }
  const templateVars = {
    user
  }
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let user = {};
  if (users[req.cookies["user_id"]]) {
    user = users[req.cookies["user_id"]];
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
  urlDatabase[newShortURL] = req.body.longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${newShortURL}`);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  // console.log(templateVars);
  // console.log(req);
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  // console.log(req.body);
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!password || !email) {
    return res.status(400).send("You must enter a valid email and/or password");
  }

  if (checkUserExist(email)) {
    return res.status(400).send("This user already exist");
  }

  users[id] = { id, email, password };

  res.cookie("user_id", id);
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

  if (!checkUserExist(email)) {
    return res.status(403).send("Cannot find user with that email");
  }

  if (foundUser.password !== password) {
    return res.status(403).send("Password is incorrect");
  }

  res.cookie("user_id", foundUser.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});