import http from 'http'
import express from 'express'
import Promise from 'bluebird'
import config from './config'
import bot from './bot'
import bodyParser from 'body-parser'


let app = express()
app.server = http.createServer(app)

// Body Parser
app.use(bodyParser.json())

// Mount the bot
app.use('/webhook', bot.router())

app.server.listen(process.env.PORT || 5000)
console.log(`Started on port ${app.server.address().port}`)

export default app
