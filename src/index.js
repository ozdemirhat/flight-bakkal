import http from 'http'
import express from 'express'
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

// Body Parser
app.use(bodyParser.json())
//
// Mount all routes
app.use('/', routes)

// API Error Handler
app.use(ErrorHandler)

app.server.listen(process.env.PORT || 80)
console.log(`Started on port ${app.server.address().port}`)

export default app
