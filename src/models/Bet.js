const { Schema, model } = require('mongoose')

const betSchema = new Schema({
    rouletteId: String,
    userId: String,
    createdAt: Date,
    betType: String,
    betOption: String,
    amountOfMoney: Number
})

module.exports = model('bet', betSchema)