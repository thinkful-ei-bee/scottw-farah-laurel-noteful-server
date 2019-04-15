require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const { NODE_ENV } = require('./config')
const logger = require('./logger')
const notefulRouter = require('./noteful-router');
const notefulService = require('./noteful-service');
const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use(notefulRouter);


//THIS WILL HAVE TO CHANGE
// app.get('/', (req, res,next) => {
//   const knexInstance = req.app.get('db');
//   notefulService.getAllBookmarks(knexInstance)
//     .then(bookmarks => {
//       res.json(bookmarks);
//     })
//     .catch(next);
// });

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app

