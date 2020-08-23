const app = require('./app')
require('./database')

async function init() {
    const port = process.env.PORT || 3000
    await app.listen(port)
    console.log(`Server on port ${port}`)
}

init()