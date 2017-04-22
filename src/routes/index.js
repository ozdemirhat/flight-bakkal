import express from 'express'
import config from '../config'
import {Bot, Elements, Buttons} from 'facebook-messenger-bot'

const router = express.Router()

const bot = new Bot(config.PAGE_ACCESS_TOKEN, config.LOCAL_SHAKE);

bot.on('message', async (message) => {
    const {sender} = message;

    let out, buttons;

    // ---- send image
    out = new Elements();
    out.add({image: 'https://images.trvl-media.com/media/content/expus/graphics/launch/home/tvly/150324_flights-hero-image_1330x742.jpg'});
    await bot.send(sender.id, out);

    // ---- send text
    out = new Elements();
    out.add({text: "Where do you want to fly today? Just write me."});
    await bot.send(sender.id, out);

    await Bot.wait(1000);
});

// all postbacks are emitted via 'postback'
bot.on('postback', async (event, message, data) => {
    assert(data === message.data);
    assert(event === message.event);

    console.log(event, message, data);
});

// if the data cannot be parsed, an 'invalid-postback' is emitted
bot.on('invalid-postback', async (message) => {
    console.log(message);
});

router.use('/webhook', bot.router());

export default router
