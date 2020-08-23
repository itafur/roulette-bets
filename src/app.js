const express = require('express')
const cors = require('cors')
const app = express()
const morgan = require('morgan')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use('/roulette', require('./routes/Roulette'))

module.exports = app