const { alldown } = require("aryan-videos-downloader");
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios'); // Add axios for video streaming

// Replace with your bot token
const botToken = '8156707157:AAGKNB6cyvY7rWYAaWqWFvGa6uk_2s6vHPw'; // Use your bot's API token here
const bot = new TelegramBot(botToken, { polling: true });

// Listen for incoming messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const url = msg.text.trim(); // Get the URL sent by the user

    // Validate the URL before proceeding
    if (!isValidUrl(url)) {
        return bot.sendMessage(chatId, 'Invalid URL. Please send a valid video URL.');
    }

    // Send a message to the user to indicate processing
    const loadingMessage = await bot.sendMessage(chatId, 'Processing your request...');

    try {
        // Use the correct variable `url` for the video download
        const data = await alldown(url);
        console.log(data);

        const { low, high, title } = data.data; // Get the high-quality link and title

        let aryan;
        try {
            // Try to get the high-quality video stream
            const vidResponse = await axios.get(high, { responseType: 'stream' });
            aryan = vidResponse.data; // Store the video stream
        } catch (error) {
            console.error('Error streaming video:', error);
            aryan = high; // Fallback to the high-quality link in case of error
        }

        // Send the video file to the user
        await bot.sendVideo(chatId, aryan, {
            caption: `🎬 𝐕𝐈𝐃𝐄𝐎 𝐓𝐈𝐓𝐋𝐄: ${title}`,
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Bot Owner', url: 'https://t.me/ArYANAHMEDRUDRO' }]
                ]
            }
        });

        // Delete the loading message after sending the video
        bot.deleteMessage(chatId, loadingMessage.message_id);

    } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, '𝐅𝐀𝐈𝐋𝐄𝐃 𝐓𝐎 𝐁𝐎𝐓 𝐓𝐇𝐄 𝐕𝐈𝐃𝐄𝐎.\n𝐏𝐋𝐄𝐀𝐒𝐄 𝐂𝐇𝐄𝐂𝐊 𝐓𝐇𝐄 𝐋𝐈𝐍𝐊 𝐀𝐍𝐃 𝐓𝐑𝐘 𝐀𝐆𝐀𝐈𝐍.');
    }
});

// Helper function to validate URL
function isValidUrl(url) {
    const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return regex.test(url);
}

console.log("ArYAN Telegram Bot Running");
