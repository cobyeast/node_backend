const express = require('express')
const path = require('path')


// Load env files
require('dotenv').config()

const PORT: string | number = process.env.PORT || 8000;

// Security Related
const helmet = require('helmet')
// const xss = require('xss')
const limit = require('express-rate-limit')
const hpp = require('hpp')


const app = express()

// Apply Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(helmet())
// app.use(xss())

const limiter = limit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
})

app.use(limiter)
app.use(hpp())

// Set up Static HTML page
app.use(express.static(path.join(__dirname, 'public')));


const auth = require('./routes/authRoute')
const users = require('./routes/userRoute')

app.use('/api/auth', auth)
app.use('/api/users', users)


const server:any = app.listen(
  PORT,
  () => { 
    console.log(`Server is listening in ${process.env.NODE_ENV} mode on port ${PORT}`) 
  }
)


const knex = require('./postgres/knex')


process.on('SIGTERM', ():void => {

  console.info('SIGTERM signal received')
  console.log('Closing sever')

  server.close(() => {

    console.log('http connection closed')

    // End DB connection and exit server
    knex.end()
    process.exit(0)

  })

})

export default express;