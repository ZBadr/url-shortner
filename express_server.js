"use strict";
const express = require("express");
const randomstring = require("randomstring");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');


const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs")

let urlDatabase = {};

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
  let templateVars = { userId: req.cookies["userId"]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (users[req.cookies["userId"]]) {
    res.send(400, {Error: "You are already registered on this website!"});
  }
  let userId = generateRandomString();
  let p = "";

  if (req.body.Email === "" || req.body.Password === "") {
    res.send(400, {Error: "Please enter your email and password correctly"});
  } else {
    res.cookie("userId", userId);
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
    userId: req.cookies["userId"]
  });
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/")
});

app.get("/login", (req, res) => {

  res.render("login", {
    userId: req.cookies["userId"]
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
        res.cookie("userId", users[temp].id);
        res.redirect("/");
      }
    } if (checker === 0) {
      res.send(403, {Error: "Tsk tsk tsk, try again"});
  }
});
  // res.cookie("user_id", users[req.cookies["user_id"]]);

app.get("/urls/new", (req, res) => {
  let e = getEmail(req.cookies["userId"]);
  let templateVars = { userId: req.cookies["userId"], email: e}
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let e = getEmail(req.cookies["userId"]);
  let templateVars = { userId: req.cookies["userId"], urls: urlDatabase, email: e};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = [req.body.longURL, req.cookies["userId"]];
  console.log(urlDatabase);
  res.redirect(`/urls/${randomURL}`);
});

app.get("/urls/:id", (req, res) => {
  let e = getEmail(req.cookies["userId"]);
  let templateVars = { userInfo: users[req.cookies["userId"]],
                       userId: req.cookies["userId"],
                       shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id][0],
                       email: e};
  res.render("urls_show", templateVars);
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




