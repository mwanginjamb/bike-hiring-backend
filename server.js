const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { sequelize } = require('./models/index')
const tripRoutes = require("./routes/trips")
require('dotenv').config();

const app = express()
const PORT = process.env.PORT || 5000
//  use CORS middleware to allow requests from all Origins
app.use(cors())

app.use(bodyParser.json())
app.use('/api', tripRoutes)

sequelize.sync().then(() => {
    console.log('DB Synched.')
    app.listen(PORT, () => {
        console.log(`Server is running on Port ${PORT}`)
    })
});