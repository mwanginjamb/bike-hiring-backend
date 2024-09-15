const express = require('express')
const bodyParser = require('body-parser')
const { sequalize } = require('./models')
const tripRoutes = require("./routes/trips")


require('dotenv').config();

const app = express()
const PORT = process.env.PORT || 5000

app.use(bodyParser.json())
app.use('/api', tripRoutes)

sequalize.sync().then(() => {
    console.log('DB Synched.')
    app.listen(PORT, () => {
        console.log(`Server is running on Port ${PORT}`)
    })
});