const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (doesExist(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Helper data fetchers (can be backed by a local endpoint or booksdb)
const fetchAllBooks = async () => {
  return books;
};

const fetchBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });
};

// Task 10: Get all books using async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/books-data`);
    return res.status(200).send(JSON.stringify({ books: response.data }, null, 4));
  } catch (err) {
    // Fallback directly to async retrieval if self-request isn't reachable
    try {
      const bookList = await fetchAllBooks();
      return res.status(200).send(JSON.stringify({ books: bookList }, null, 4));
    } catch (fallbackErr) {
      return res.status(500).json({ message: "Error retrieving books" });
    }
  }
});

// Raw books JSON route used by Axios calls above
public_users.get('/books-data', function (req, res) {
  return res.status(200).json(books);
});

// Task 11: Get book details based on ISBN using async/await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${BASE_URL}/books-data`);
    const book = response.data[isbn];
    if (book) {
      return res.status(200).send(JSON.stringify(book, null, 4));
    }
    return res.status(404).json({ message: "Book not found" });
  } catch (err) {
    try {
      const book = await fetchBookByISBN(isbn);
      return res.status(200).send(JSON.stringify(book, null, 4));
    } catch (fallbackErr) {
      return res.status(fallbackErr.status || 500).json({ message: fallbackErr.message || "Error retrieving book by ISBN" });
    }
  }
});

// Task 12: Get book details based on author using Promise callbacks with Axios
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  axios.get(`${BASE_URL}/books-data`)
    .then((response) => {
      const allBooks = response.data;
      const matchingBooks = Object.keys(allBooks)
        .filter((key) => allBooks[key].author === author)
        .map((key) => ({ isbn: key, ...allBooks[key] }));

      return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    })
    .catch(() => {
      const matchingBooks = Object.keys(books)
        .filter((key) => books[key].author === author)
        .map((key) => ({ isbn: key, ...books[key] }));

      return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    });
});

// Task 13: Get all books based on title using Promise callbacks with Axios
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  axios.get(`${BASE_URL}/books-data`)
    .then((response) => {
      const allBooks = response.data;
      const matchingBooks = Object.keys(allBooks)
        .filter((key) => allBooks[key].title === title)
        .map((key) => ({ isbn: key, ...allBooks[key] }));

      return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    })
    .catch(() => {
      const matchingBooks = Object.keys(books)
        .filter((key) => books[key].title === title)
        .map((key) => ({ isbn: key, ...books[key] }));

      return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;