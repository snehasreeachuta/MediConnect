const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const express = require('express');

console.log('All backend dependencies verified successfully!');
console.log({
  bcrypt: typeof bcrypt.hash === 'function',
  mysql2: typeof mysql.createPool === 'function',
  jwt: typeof jwt.sign === 'function',
  multer: typeof multer === 'function',
  pdfParse: typeof pdfParse === 'function',
  express: typeof express === 'function'
});
