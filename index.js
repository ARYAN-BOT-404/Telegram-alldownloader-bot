const Telegraf = require('node-telegram-bot-api');
const { alldl } = require('aryan-videos-downloader');
const axios = require('axios')
const util = require('util');
const chalk = require('chalk');
const figlet = require('figlet');
const express = require('express'); 
const app = express();
const path = require('path')
const port = process.env.PORT || 8080;

// express 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'aryan.html'));
});

function listenOnPort(port) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
app.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use. Trying another port...`);
      listenOnPort(port + 1);
    } else {
      console.error(err);
    }
  });
}

listenOnPort(port);

// Bot config token 
let token = '7722550278:AAE3effE5jwMdZ-vUCLAWXKoqlxx6fUSePM'  //replace this part with your bot token
const bot = new Telegraf(token, { polling: true });
let Start = new Date();

const logs = (message, color) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(chalk[color](`[${timestamp}] => ${message}`));
};

const Figlet = () => {
  figlet('tiktokdl', { font: 'Block', horizontalLayout: 'default' }, function (err, data) {
    if (err) {
      console.log('Error:', err);
      return;
    }
    console.log(chalk.yellow.bold(data));
    console.log(chalk.yellow(`ArYAN`));
  });
};

bot.on('polling_error', (error) => {
  logs(`Polling error: ${error.message}`, 'blue');
});

// set menu
bot.setMyCommands([
  {
    command: '/start',
    description: 'Start a new conversation'
  }
 ]);

// command
bot.onText(/^\/start$/, (msg) => {
const From = msg.chat.id;
const caption = `
Eusy Tiktok downloader`
bot.sendMessage(From, caption);
});




bot.on('message', async (msg) => {
  Figlet();
  logs('Success activated', 'green');
  
  const From = msg.chat.id;
  const text = msg.text;

  
  const body = /^https/;
  if (body.test(text)) {
    const url = text;
    try {
      
      const data = await alldl(url);
      console.log(data);


      const lowQuality = data.data.low;
      const highQuality = data.data.high;
      const title = data.data.title;

      
      const replyMarkup = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Low Quality', callback_data: 'low' }],
            [{ text: 'High Quality', callback_data: 'high' }]
          ]
        }
      };

      
      await bot.sendMessage(From, `Please choose the video quality:`, replyMarkup);

      // Handle the callback when the user chooses the quality
      bot.once('callback_query', async (callbackQuery) => {
        // Only handle the callback if it's from the same user
        if (callbackQuery.message.chat.id !== From) {
          return;
        }

        const quality = callbackQuery.data;
        
        // Select the correct video URL based on user choice
        let videoUrl = quality === 'high' ? highQuality : lowQuality;

        try {
          
          const videoBuffer = (await axios.get(videoUrl, { responseType: 'arraybuffer' })).data;
          
          // Send the selected video
          await bot.sendVideo(From, videoBuffer, { caption: title });
          await bot.sendMessage(From, 'POWERED BY ArYAN AHMED RUFRO');
          
          
          await bot.answerCallbackQuery(callbackQuery.id);
        } catch (error) {
          
          await bot.sendMessage(From, 'Sorry, there was an error downloading the video.');
          logs(`[ ERROR ] ${From}: ${error.message}`, 'red');
        }
      });

    } catch (error) {
        bot.sendMessage(From, 'Sorry, an error occurred while downloading the video.');
        console.log(`[ ERROR ] ${From}: ${error.message}`, 'red');
    }
}
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
