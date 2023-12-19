const express = require('express')
const app = express()
const port = 3000

app.use(express.json()); // Para parsear datos del body en formato.json

// Import routes from routes file and mount them
const router = require('./routes');
app.use('/', router);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})