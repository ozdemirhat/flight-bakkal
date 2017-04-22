import express from 'express'
import config from '../config'
import {Bot, Elements} from 'facebook-messenger-bot'

const router = express.Router()

const bot = new Bot(config.PAGE_ACCESS_TOKEN, config.LOCAL_SHAKE);

bot.on('message', async message => {
    const {sender} = message;

    let out, buttons;

    // ---- send text
    out = new Elements();
    out.add({text: 'hey! what up'});
    await bot.send(sender.id, out);

    // wait for 1s
    await Bot.wait(1000);

    // ---- send image
    out = new Elements();
    out.add({image: 'https://developers.facebook.com/images/devsite/fb4d_logo-2x.png'});
    await bot.send(sender.id, out);

    await Bot.wait(1000);

    // ---- send buttons (single card)
    buttons = new Buttons();
    buttons.add({text: 'Google', url: 'http://google.com'});
    buttons.add({text: 'Yahoo', url: 'http://yahoo.com'});
    buttons.add({text: 'Bing', url: 'http://bing.com'});
    out = new Elements();
    out.add({text: 'search engines', subtext: 'click to get redirected', buttons}); // add a card
    await bot.send(to, out);

    // ---- send share/call buttons
    buttons = new Buttons();
    buttons.add({text: 'Call us', phone: '+808 863718243'});
    buttons.add({share: true});
    out = new Elements();
    out.add({text: 'ABC Flower shop', subtext: 'Office hours 10am - 6pm', buttons}); // add a card
    await bot.send(to, out);

    await Bot.wait(2000);

  	// ---- send list
  	out = new Elements();
    out.setListStyle('compact'); // or 'large'
  	out.add({text: 'Item 1', subtext: 'Subtitle'}); // add list item
  	out.add({text: 'Item 2', subtext: 'Subtitle'}); // add list item
  	await bot.send(sender.id, out);

    // ---- send image + buttons (multiple cards)
    buttons = new Buttons();
    buttons.add({text: 'Google', url: 'http://google.com'});
    buttons.add({text: 'Yahoo', url: 'http://yahoo.com'});
    out = new Elements();
    out.add({image: 'http://google.com/logo.png', text: 'hey', buttons}); // first card
    out.add({image: 'http://yahoo.com/logo.png', text: 'hey', buttons}); // second card
    await bot.send(to, out);

    // ---- send call button
    buttons = new Buttons();
    buttons.add({text: 'Call us now', phone: '+16505551234'});
    out = new Elements();
    out.add({text: 'Contact us', subtext: 'click to start a phone call', buttons});
    await bot.send(to, out);

    // ---- send quick reply for location
    let replies = new QuickReplies();
    replies.add({text: 'location', isLocation: true});
    out = new Elements();
    out.add({text: 'Send us your location'});
    out.setQuickReplies(replies);
    await bot.send(to, out);
});

router.use('/webhook', bot.router());

export default router
