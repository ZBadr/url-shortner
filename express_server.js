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
  let templateVars = { userInfo: users[req.cookies["user_id"]]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    res.send(400, {Error: "You are already registered on this website!"});
  }
  let user_id = generateRandomString();

  if (req.body.Email === "" || req.body.Password === "") {
    res.send(400, {Error: "Please enter your email and password correctly"});
  } else {
    res.cookie("user_id", user_id);
    users[user_id] = {};
    users[user_id]["id"] = user_id;
    users[user_id]["email"] = req.body.Email;
    users[user_id]["password"] = req.body.Password;
    console.log(users);
    res.redirect("/");
  }

});

app.get("/", (req, res) => {
  console.log(users[req.cookies["user_id"]]);
  res.end("word");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/")
});

app.get("/login", (req, res) => {
  res.render("login")
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/")
});

app.get("/urls/new", (req, res) => {
  let templateVars = users[req.cookies["user_id"]];
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect(`/urls/${randomURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body["longURL"];
  res.redirect('/urls')
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { userInfo: users[req.cookies["user_id"]],
                       shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/urls", (req, res) => {
  let templateVars = { userInfo: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




