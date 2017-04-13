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

function generateRandomString() {
  let random = randomstring.generate({
    length: 6,
    charset: 'alphanumeric'
  });
  return random;
}

app.get("/", (req, res) => {
res.render("homepage");
});

app.post("/login", (req, res) => {
  console.log(req.body.username);
  res.cookie('username', req.body.username);
  res.redirect('/')

});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  urlDatabase[shortURL] = req.body['longURL'];
  res.redirect('/urls')
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




