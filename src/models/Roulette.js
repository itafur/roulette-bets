const { Schema, model } = require('mongoose')

const rouletteSchema = new Schema({
    status: String,
    createdAt: Date,
    openedAt: Date,
    closedAt: Date
})

module.exports = model('roulette', rouletteSchema)