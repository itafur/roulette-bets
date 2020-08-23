const mongoose = require('mongoose')

const URL_DATABASE = 'mongodb+srv://itafur:itafur@cluster0-4avrn.mongodb.net/roulettedb?retryWrites=true&w=majority'

mongoose.connect(URL_DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Database is connected')
}).catch(err => {
    console.error(err)
})