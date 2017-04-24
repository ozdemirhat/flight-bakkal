import config from '../config'
import skyscanner from '../lib/skyscanner'
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

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379')
const bot = new Bot(config.PAGE_ACCESS_TOKEN, config.LOCAL_SHAKE)

let to

const setWaitingData = async (key, value) => {
  if (key == 'to' || key == 'from') {
    let location = await skyscanner.getLocation(value)
    console.log(location)
    if (location[0]) {
      redis.hset(to, key, location[0].id)
      await sendMessage(`Location set: ${location[0].name}`)
      return null
    } else {
      return "Couldn't find a place with that name."
    }
  } else if (key == 'departure' || key == 'arrival') {
    redis.hset(to, key, value)
  }
}

const sendMessage = async (message) => {
  let out = new Elements()
  out.add({text: message})
  await bot.send(to, out)
}

bot.on('message', async (message) => {
  const {sender} = message
  await sender.fetch('first_name', true)

  to = sender.id

  if (message.text == 'reset') {
    redis.del(to)
    redis.del(`${to}:waiting`)
    await sendMessage("Resetting...")
    return
  }

  let waitingData = await redis.get(`${to}:waiting`)

  if (waitingData) {
    let callbackMessage = await setWaitingData(waitingData, message.text)
    if (callbackMessage) {
      await sendMessage(callbackMessage)
      return
    }
  }

  let userData = await redis.hgetall(to)

  if (!userData.from) {
    redis.set(`${to}:waiting`, 'from')
    await sendMessage("Where are you right now or where do you want to fly from? You can reset the the process with just writing 'reset'.")
    return
  }

  if (!userData.to) {
    redis.set(`${to}:waiting`, 'to')
    await sendMessage("Where do you want to fly?")
    return
  }

  if (!userData.departure) {
    redis.set(`${to}:waiting`, 'departure')
    await sendMessage("When do you want to fly? Please write in YYYY-MM-DD format.")
    return
  }

  if (!userData.arrival) {
    redis.set(`${to}:waiting`, 'arrival')
    await sendMessage("When will you come back? Please write in YYYY-MM-DD format.")
    return
  }

  redis.del(`${to}:waiting`)

  await sendMessage("Here is a bug, I am uncompleted bot.")

  let data = await skyscanner.searchCache('US', 'USD', 'en-US', userData.from, userData.to, userData.departure, userData.arrival)
  console.log(data)
  if (data[0]) {
    await sendMessage("Here is our recommendation: (Type reset to start again)")
    console.log(data[0])
    return
  }

  await sendMessage("We couldn't find a flight for you. Type reset to start again.")

})

export default bot