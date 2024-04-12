const express = require('express');
const axios = require('axios').default; // Samanta
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req,res) => {
  // TASK 6
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: `User ${username} already exists!`});    
    }
  } 
  else {
      return res.status(404).json({message: "Unable to register"})
  }
});

// // Get the book list available in the shop
// public_users.get('/',function (req, res) {
//   //TASK 1
//   return res.status(200).send(JSON.stringify(books,null,4));
// });

let promiseBooks = new Promise((resolve, reject) => {
  try {
    resolve(JSON.stringify(books,null,4));
  }
  catch(err) {
    reject(err);
  }
    
});
// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //TASK 10 = TASK 1 WITH PROMISE
  promiseBooks.then(
    (data) => {
    return res.status(200).send(data);
    },
    (err) => {
      return res.status(500).send(err);
    }
  );
});

// // Get book details based on ISBN
public_users.get('/isbn_bis/:isbn',function (req, res) {
  //TASK 2
  let isbn = req.params.isbn;
  let book = books[isbn];
  return res.status(200).json(book);   
 });

function bookPromise(isbn) {
  return new Promise((resolve, reject) => {
    try {
      let book = books[isbn];
      if (book) {
        resolve(books[isbn]); 
      }
      else {
        resolve("book with isbn " + isbn + " not found!");
      }  
    }
    catch(err) {
      reject(err);
    }
     
  });
}

 // Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //TASK 11 = TASK 2 WITH PROMISE
  let isbn = req.params.isbn;
  
  if (isbn) {
    bookPromise(isbn).then(
      (data) => {
      return res.status(200).json(data); 
      },
      (err) => {
          console.log(err);
          return res.status(500).send(err); 
      }
    );    
  }
  else {
    return res.status(204).send(`isbn ${isbn} not valid!`);
  }
 });
  
 async function connectToURL(url) {
  let result = await axios.get(url);
  console.log("\nRisultato della ConnectToURL:\n");
  console.log(result.data);
  return result.data;
 }

// Get book details based on author
public_users.get('/author_bis/:author',function (req, res) {
  //TASK 3 renamed this function to simulate a call to an external url
  let author = req.params.author;
  let keys = Object.keys(books);
  let filtered_books = new Array();
  
  keys.forEach(element => {
    if (books[element].author.toUpperCase() == author.toUpperCase()) {
      filtered_books.push(books[element]);      
    }
  }); 
  return res.status(200).json(filtered_books);
});


// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  //TASK 12 = TASK 3 WITH AXIOS I TRIED TO SIMULATE A CALL TO EXERCICE WITH AXIOS AND ASYNC/AWAIT
  //I renamed the old function of task 3 in order to call it from inside this new version of task 3
  let author = req.params.author;
  let url = "http://localhost:5000/author_bis/" + author;
  console.log(url);
  let filtered_books = await connectToURL(url);  
  console.log(filtered_books);
  if (filtered_books.length == 0) {
    return res.status(200).json({message: "Author not found!"}); 
  }
  else {
    return res.status(200).json(filtered_books);
  }
});

// // Get all books based on title
// public_users.get('/title/:title',function (req, res) {
//   //TASK 4
//   let title = req.params.title;
//   let keys = Object.keys(books);
  
//   keys.forEach(element => {
    
//     if (books[element].title.toUpperCase() == title.toUpperCase()) {
//       return res.status(200).send(books[element]);
//     }
//   }); 

//   return res.status(204).send(`Title ${title} not found in books`);
// });

async function findBookByTitle(title) {
  return new Promise((resolve, reject) => {
    try {
      let keys = Object.keys(books);
      keys.forEach(element => {        
        if (books[element].title.toUpperCase() == title.toUpperCase()) {
          resolve(books[element]);
        }
      });  
      resolve("book not found: " + title);     
    }
    catch(err) {
      reject(err);
    }
  });
  }

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  //TASK 13 = TASK 4 USING PROMISE
  let title = req.params.title;
  console.log("Before call await-async");
  let data = await findBookByTitle(title);
  console.log("After call await-async:\n");
  console.log(data);
  return res.status(200).send(data);
})
//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //TASK 5
  let isbn = req.params.isbn;
  
  if (books[isbn]) {
    return res.status(200).send(books[isbn].reviews); 
  }
  else {
    return res.status(200).send(`isbn ${isbn} not found!`);
  }
});


module.exports.general = public_users;
