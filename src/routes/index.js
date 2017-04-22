import express from 'express'
import {Bot, Elements} from 'facebook-messenger-bot'

const router = express.Router()

const bot = new Bot(config.PAGE_ACCESS_TOKEN, config.LOCAL_SHAKE);

bot.on('message', async message => {
    const {sender} = message;
    await sender.fetch('first_name');

    const out = new Elements();
    out.add({text: `hey ${sender.first_name}, how are you!`});

    await bot.send(sender.id, out);
});

router.get('/webhook', bot.router());

export default router
