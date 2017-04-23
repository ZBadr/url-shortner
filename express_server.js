"use strict";
const express = require("express");
const randomstring = require("randomstring");
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');


const app = express();
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["keys1", "keys2"],

  // Cookie Options
  // maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs")

let urlDatabase = {
  "b2xVn2": ["http://www.lighthouselabs.ca", "userId1"],
  "9sm5xK": ["http://www.google.com", "userId2"]
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

function generateRandomString() {
  let random = randomstring.generate({
    length: 6,
    charset: 'alphanumeric'
  });
  return random;
}

function getEmail(userId) {
  // console.log(userId);
  for (var i in users) {
    console.log(i, userId);
    if (i === userId) {
      return users[userId]["email"];
    }
  }
}

app.get("/register", (req, res) => {
  let templateVars = { userId: req.session["userId"]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (users[req.session["userId"]]) {
    res.send(400, {Error: "You are already registered on this website!"});
  }
  let userId = generateRandomString();
  let p = "";

  if (req.body.Email === "" || req.body.Password === "") {
    res.send(400, {Error: "Please enter your email and password correctly"});
  } else {
    req.session.userId = userId;
    // res.cookie("userId", userId);
    users[userId] = {};
    users[userId]["id"] = userId;
    users[userId]["email"] = req.body.Email;
    p = req.body.Password;
    users[userId]["password"] = bcrypt.hashSync(p, 10);;
    console.log(users);
    res.redirect("/");
  }

});

app.get("/", (req, res) => {
  // console.log(req.cookies["userId"]);
  res.render("homepage", {
    userId: req.session["userId"]
  });
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/")
});

app.get("/login", (req, res) => {

  res.render("login", {
    userId: req.session["userId"]
  })
});

app.post("/login", (req, res) => {
  if (req.body.Email === "" || req.body.Password === "") {
    res.send(400, {Error: "Please enter your email and password correctly"});
  }

  let checker = 0;
  for (var i in users) {
    let temp = i;
    console.log(users[temp].password);
    if(users[temp].email === req.body.Email && bcrypt.compareSync(req.body.Password, users[temp].password)) {
        checker = 1;
        req.session.userId = users[temp].id;
        res.redirect("/");
      }
    } if (checker === 0) {
      res.send(403, {Error: "Tsk tsk tsk, try again"});
  }
});
  // res.cookie("user_id", users[req.cookies["user_id"]]);

app.get("/urls/new", (req, res) => {
  let e = getEmail(req.session["userId"]);
  let templateVars = { userId: req.session["userId"], urls: urlDatabase, email: e};
  res.render("urls_new", templateVars);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let e = getEmail(req.session["userId"]);
  let templateVars = { userId: req.session["userId"], urls: urlDatabase, email: e};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomURL = generateRandomString();
  let e = getEmail(req.session["userId"]);
  urlDatabase[randomURL] = [req.body.longURL, req.session["userId"]];
  let templateVars = { userId: req.session["userId"], urls: urlDatabase, email: e};
  console.log(urlDatabase);
  // res.redirect(`/urls/${randomURL}`);
  res.render("urls_index", templateVars);
});




app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id][1] === req.session["userId"]) {
  if (urlDatabase[req.params.id]) {
  let e = getEmail(req.session["userId"]);
  let templateVars = { userInfo: users[req.session["userId"]],
                       userId: req.session["userId"],
                       shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id][0],
                       email: e};
  res.render("urls_show", templateVars);
} else {
  res.send(404, {Error: "This URL does not exist"});
}
} else {
  res.send(401, {Error: "Tsk tsk, nice try though :D"});
}
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL][0] = req.body["longURL"];
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL][0];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




