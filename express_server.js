const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

//cookie-parser helps us read the values from the cookie
//To set the values on the cookie, we can use res.cookie, as provided by Express:
//res.cookie(name, value [, options])
// Sets cookie name to value. The value parameter may be a string or object converted to JSON.

//we will use a simple unsigned cookie to track the username of the person once they tell us their username

app.use(cookieParser());

// parse the form data
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString(aString) {
  let randomString = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    randomString += possible.charAt(
      Math.floor(Math.random() * possible.length)
    );
  }
  return randomString;
}

app.get("/", (request, response) => {
  response.end("Main Page");
});

app.get("/urls", (request, response) => {
  let templateVars = {
    urls: urlDatabase,
    username: request.cookies["username"]
  };
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  let templateVars = {
    username: request.cookies["username"]
  };
  response.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  if (urlDatabase[request.params.shortURL] === undefined){
    response.redirect(404, "/urls/new");
  } else {
    let longURL = urlDatabase[request.params.shortURL];
    response.status(302);
    response.redirect(longURL);
  }
});

// requesting/asking the server
app.get("/urls/:id", (request, response) => {
  if (urlDatabase[request.params.id] === undefined){
    response.redirect(404, "/urls/new");
  } else {
    let templateVars = {
      shortURL: request.params.id,
      longURL: urlDatabase[request.params.id],
      username: request.cookies["username"]
    };
    response.render("urls_show", templateVars);
  }
});

// posting to the server data (url in this case)
app.post("/urls", (request, response) => {
  let shortURL = generateRandomString();
  let longURL = request.body.longURL;

  // //if doesnt start with http:// add it
  // if (longURL.substring(0, 6) !== "http://") {
  //   longURL = "http://" + longURL;
  // }

  urlDatabase[shortURL] = longURL;
  response.status(302);
  response.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:id/delete', (request, response) => {
  let currKey = request.params.id;
  delete urlDatabase[currKey];
  response.redirect('/urls');
});

app.post('/urls/:id', (request, response) => {
  let newLongURL = request.body.longURL;

  let currKey = request.params.id;

  // assign new website to value
  urlDatabase[currKey] = newLongURL;

  response.redirect('/urls');
});

app.post('/login', (request, response) => {
  let user = request.body.username;
  response.cookie('username', user);
  response.redirect('/urls');
});

app.post('/logout', (request, response) => {
  let user = request.body.username;
  response.clearCookie('username', user);
  response.redirect('/urls');
});

//start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
