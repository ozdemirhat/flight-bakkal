import express from 'express'
import config from '../config'
import {Bot, Elements, Buttons} from 'facebook-messenger-bot'
import Redis from 'ioredis'

Redis.Command.setReplyTransformer('hgetall', (result) => {
  if (Array.isArray(result)) {
    var obj = {}
    for (var i = 0; i < result.length; i += 2) {
      obj[result[i]] = result[i + 1]
    }
    return obj
  }
  return result
})

var redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379')

const router = express.Router()

const bot = new Bot(config.PAGE_ACCESS_TOKEN, config.LOCAL_SHAKE)

bot.on('message', async (message) => {
    const {sender} = message
    await sender.fetch('first_name', true)
    let userData = await redis.hgetall(sender.id)
    let out = new Elements()

    if (message.text == 'reset') {
      out.add({text: "Resetting..."})
      await bot.send(sender.id, out)
      return
    }

    if (message.text == 'help') {
      out.add({text: "Help..."})
      await bot.send(sender.id, out)
      return
    }

    let userWaiting = await redis.get(`${sender.id}:waiting`)

    if (userWaiting) {
        redis.hset(sender.id, userWaiting, message.text)
    }

    out = new Elements()

    if (!userData.from && !userData.to) {
      out.add({text: "Where do you want to fly today? Just write me."})
      redis.set(`${sender.id}:waiting`, 'to')
    } else if (userData.from && !userData.to) {
      out.add({text: "Where do you want to fly?"})
      redis.set(`${sender.id}:waiting`, 'to')
    } else if (!userData.from && userData.to) {
      out.add({text: "Where are you right now or where do you want to fly from?"})
      redis.set(`${sender.id}:waiting`, 'from')
    } else {
      out.add({text: "Here is our recommendation"})
      redis.del(`${sender.id}:waiting`)
    }

    await bot.send(sender.id, out)

    await Bot.wait(1000)
})

// all postbacks are emitted via 'postback'
bot.on('postback', async (event, message, data) => {
    assert(data === message.data)
    assert(event === message.event)

    console.log(event, message, data)
})

// if the data cannot be parsed, an 'invalid-postback' is emitted
bot.on('invalid-postback', async (message) => {
    console.log(message)
})

router.use('/webhook', bot.router())

router.get('/', async (req, res) => {
  redis.hset('test', 'foo', 'bar')
  let test = await redis.hgetall('test')
  res.json(test)
})

export default router
