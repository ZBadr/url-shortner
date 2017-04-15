"use strict";
const express = require("express");
const randomstring = require("randomstring");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs")

let urlDatabase = {
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

function generateRandomString() {
  let random = randomstring.generate({
    length: 6,
    charset: 'alphanumeric'
  });
  return random;
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

  if (req.body.Email === "" || req.body.Password === "") {
    res.send(400, {Error: "Please enter your email and password correctly"});
  } else {
    res.cookie("userId", userId);
    users[userId] = {};
    users[userId]["id"] = userId;
    users[userId]["email"] = req.body.Email;
    users[userId]["password"] = req.body.Password;
    // console.log(users);
    res.redirect("/");
  }

});

app.get("/", (req, res) => {
  // console.log(users[req.cookies["user_id"]]);
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
  let userId = generateRandomString();
  let checker = 0;
  for (var i in users) {
    let temp = i;
    // console.log(temp);
    if(users[temp].email === req.body.Email && users[temp].password === req.body.Password) {
        res.cookie("userId", userId);
        checker = 1;
        res.redirect("/");
      }
    } if (checker === 0) {
      res.send(403, {Error: "Tsk tsk tsk, try again"});
  }
});
  // res.cookie("user_id", users[req.cookies["user_id"]]);

app.get("/urls/new", (req, res) => {
  let templateVars = { userId: req.cookies["userId"]}
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { userId: req.cookies["userId"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect(`/urls/${randomURL}`);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { userInfo: users[req.cookies["userId"]],
                       userId: req.cookies["userId"],
                       shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body["longURL"];
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




