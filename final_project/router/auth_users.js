const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let validusers = users.filter((user)=>{
    return (user.username === username)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  //write code to check if username and password match the one we have in records.
  if(isValid(username)){
    let validusers = users.filter((user)=>{
      return (user.username === username && user.password === password)
    });
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  // TASK 7
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in. Userid or password not provided"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: "1d"});

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send(`User ${JSON.stringify(req.session.authorization.username)} successfully logged in in session`);
  } else {
    return status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  //TASK 8

  let current_user = req.session.authorization.username;
  let current_review = req.query.review;
  let current_isbn = req.params.isbn;

  if (!current_user || !current_review ) {
    return res.status(400).send(`user: ${current_user } or review: ${current_review} is invalid!`);
  }

  var current_book = books[current_isbn];
  let current_reviews = current_book.reviews;
  let appo;
  let user;
  let review;
  let new_reviews = new Array();
  let found = false;
  let output = "";

  console.log("Old reviews:\n")
  console.log(current_reviews);

  for (let i = 0; i < current_reviews.length; i ++) {
    appo = JSON.stringify(current_reviews[i]);
    user = JSON.parse(appo).user;
    
    if (current_user == user) {
      found = true;
      review = current_review;
      new_reviews.push({"user" : current_user, "review" : current_review});
    }   
    else {
      review = JSON.parse(appo).review;
      new_reviews.push({"user" : user, "review" : review});
    }
    
  }
  
  if (!found) {
    new_reviews.push({"user" : current_user, "review" : current_review});
  }
  console.log("New reviews:\n")
  console.log(new_reviews);

  output = "Review: " + current_review;

  if (found) {
    output += " updated ";
  }
  else {
    output += " added "
  }
  
  current_book.reviews = new_reviews;

  output += " for book with isbn: " + current_isbn + " for user: " + current_user + "\n\nnew reviews: " 
  + JSON.stringify(new_reviews) 
  +  "\n\n new book: " + JSON.stringify(current_book);

  return res.status(200).send(output);
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  //TASK 9

  let current_user = req.session.authorization.username;
  let current_isbn = req.params.isbn;

  if (!current_user) {
    return res.status(400).send(`user: ${current_user} is invalid!`);
  }

  var current_book = books[current_isbn];
  let current_reviews = current_book.reviews;
  let appo;
  let user;
  let review;
  let new_reviews = new Array();
  let found = false;
  let output = "";

  console.log("Old reviews:\n")
  console.log(current_reviews);

  for (let i = 0; i < current_reviews.length; i ++) {
    appo = JSON.stringify(current_reviews[i]);
    user = JSON.parse(appo).user;
    review = JSON.parse(appo).review;
    if (current_user == user) {
      found = true;      
    }   
    else {
      new_reviews.push({"user" : user, "review" : review});
    }
    
  }
    
  console.log("New reviews:\n")
  console.log(new_reviews);

  if (!found) {
    return res.status(422).send("Review for user " + current_user + " for book with isbn " + current_isbn + " Not Found!");
  }
  current_book.reviews = new_reviews;
  output = "Review for user " + current_user + " for book with isbn " + current_isbn + " deleted!" +  "\n\n New book: " + JSON.stringify(current_book);  

  return res.status(200).send(output);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
