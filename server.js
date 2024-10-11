const express = require('express')
const cors = require('cors')
const path = require('path')
const bodyParser = require('body-parser')
const { sequelize } = require('./models/index')
const tripRoutes = require("./routes/trips")
const viewRoutes = require("./routes/views")
require('dotenv').config();

const app = express()
const PORT = process.env.PORT || 5000

// middleware 
app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api', tripRoutes)
app.use('/', viewRoutes)


sequelize.sync().then(() => {
    console.log('DB Synched.')
    app.listen(PORT, () => {
        console.log(`Server is running on Port ${PORT}`)
    })
});