const express = require('express');
const axios = require('axios');
const books = require('./booksdb');
const { isValid, users } = require('./auth_users');
const public_users = express.Router();

public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (isValid(username)) return res.status(409).json({ message: 'User already exists' });
  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered. Now you can login' });
});

public_users.get('/', (req, res) => res.json(books));
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book) : res.status(404).json({ message: 'Book not found' });
});
public_users.get('/author/:author', (req, res) => {
  const matches = Object.fromEntries(Object.entries(books).filter(([, b]) =>
    b.author.toLowerCase() === req.params.author.toLowerCase()));
  return res.json(matches);
});
public_users.get('/title/:title', (req, res) => {
  const matches = Object.fromEntries(Object.entries(books).filter(([, b]) =>
    b.title.toLowerCase() === req.params.title.toLowerCase()));
  return res.json(matches);
});
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book.reviews) : res.status(404).json({ message: 'Book not found' });
});

// Task 11: asynchronous Axios implementations. Start the server before calling them.
const BASE_URL = process.env.BOOK_API_URL || 'http://localhost:5000';
async function getAllBooksAsync() {
  const { data } = await axios.get(`${BASE_URL}/`);
  return data;
}
async function getBookByISBNAsync(isbn) {
  const { data } = await axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`);
  return data;
}
async function getBooksByAuthorAsync(author) {
  const { data } = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return data;
}
async function getBooksByTitleAsync(title) {
  const { data } = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
  return data;
}
module.exports = { general: public_users, getAllBooksAsync, getBookByISBNAsync, getBooksByAuthorAsync, getBooksByTitleAsync };
