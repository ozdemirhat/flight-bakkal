import http from 'http'
import express from 'express'
import mongoose from 'mongoose'
import Promise from 'bluebird'
import config from './config'
import routes from './routes'
import bodyParser from 'body-parser'
import ErrorHandler from './helpers/error-handler'
import cors from 'cors'


let app = express()
app.server = http.createServer(app)

app.use(cors({
	exposedHeaders: config.corsHeaders
}));

// Connect to MongoDB
mongoose.Promise = Promise
mongoose.connect(config.db, { server: { socketOptions: { keepAlive: 1} } })
mongoose.connection.on('error', () => {
  throw new Error(`Unable to connect to database: ${config.db}`)
})

// Body Parser
app.use(bodyParser.json())
//
// Mount all routes
app.use('/', routes)

// API Error Handler
app.use(ErrorHandler)

app.server.listen(process.env.PORT || 3000)
console.log(`Started on port ${app.server.address().port}`)

export default app
