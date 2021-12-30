const express = require('express')
const app = express()
const mongoose = require('mongoose')
const AllRoutes = require('./routes/allRoutes')
const path = require('path')

mongoose.connect(`${process.env.MONGO_URL}`, { useNewUrlParser: true })
.then(() => {
    console.log('Leggo')
})
.catch((e) => { 
    console.log(e)
})
// const uri = 'mongodb://localhost/scorptest'
// mongoose.connect(uri, { useNewUrlParser: true })
// .then(() => {
//     console.log('Leggo')
// })
// .catch((e) => {
//     console.log(e)
// })  

// Import the middle wares
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use('/images', express.static(path.join(__dirname, 'images')))

// import routs
app.use('/', AllRoutes)

// startup the server
const port = 1002
app.listen(port, () => {
    console.log(`App is ready and on port ${port}`)
})