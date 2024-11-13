const express = require('express');
require('dotenv').config();

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

module.exports = app;