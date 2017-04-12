"use strict";
const express = require("express");
const randomstring = require("randomstring");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
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

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let randomURL = generateRandomString();
  let lURL = req.body.longURL;
  urlDatabase[randomURL] = lURL;
  res.redirect(`/urls/${randomURL}`);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // console.log(req.params.shortURL);
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




