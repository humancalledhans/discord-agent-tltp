const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const TOKEN = process.env.DISCORD_TOKEN;
const BASE_URL = process.env.VUE_APP_BASE_URL_HANS ? process.env.VUE_APP_BASE_URL_HANS : "https://dion-avatar-backend.onrender.com"
const API_ENDPOINT = BASE_URL + "/fetch_agent_ta_output";

const allowedChannels = [
    '1342500995896180786',
    '1343696393952297042'
];

client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('messageCreate', async message => {
    console.log("messageCreate event triggered");
    console.log("message received: ", message.content);

    if (!allowedChannels.includes(message.channel.id)) {
        console.log("Ignoring message from channel:", message.channel.id);
        return;
    }

    if (message.author.bot) {
        console.log("Message from bot, ignoring.");
        return;
    }

    try {
        // Send thinking message immediately
        const thinkingMessage = await message.channel.send('Thinking... 🤔');

        // Check if message contains "Q breakout strategy" (case-insensitive)
        const messageContent = message.content.toLowerCase();
        if (messageContent.includes("q breakout strategy")) {
            await thinkingMessage.delete();
            const responses = [
                "The Q Breakout Strategy is one of Dion's exclusive hedge fund strategies, reserved for his private trading clients. To join, the minimum investment is $100,000. Want to learn more? Book a call with Dion!",
                "Q Breakout Strategy is a proprietary tactic from Dion’s hedge fund playbook, only available to his elite trading clients. Minimum entry: $100,000. Interested? Schedule a call with Dion to discuss.",
                "That’s one of Dion’s private hedge fund gems—the Q Breakout Strategy. It’s exclusive to his trading clients, with a $100,000 minimum to get started. Book a call with Dion for more details!"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            await message.reply(randomResponse);
            return; // Exit after sending the special response
        }

        // Original logic for other messages
        const messages = await message.channel.messages.fetch({ limit: 100 });

        let previousUserMessage = null;
        let previousBotReply = null;
        for (const msg of messages.values()) {
            if (
                msg.author.id === client.user.id &&
                msg.reference &&
                msg.reference.messageId &&
                messages.has(msg.reference.messageId) &&
                messages.get(msg.reference.messageId).author.id === message.author.id
            ) {
                previousBotReply = {
                    content: msg.content,
                    timestamp: msg.createdTimestamp,
                };
                previousUserMessage = {
                    content: messages.get(msg.reference.messageId).content,
                    timestamp: messages.get(msg.reference.messageId).createdTimestamp,
                };
                break;
            }
        }

        console.log("User's current message:", message.content);
        console.log("Previous user message:", previousUserMessage);
        console.log("Previous bot reply:", previousBotReply);

        const context = {
            user_input: message.content,
            previous_user_message: previousUserMessage ? previousUserMessage.content : null,
            previous_bot_reply: previousBotReply ? previousBotReply.content : null,
        };

        console.log('Attempting to fetch from API with context:', context);
        const response = await axios.post(API_ENDPOINT, context);
        console.log('API response data:', response.data.data);

        await thinkingMessage.delete();
        await message.reply(response.data.data.slice(0, 1999));
    } catch (error) {
        console.error('Error:', error);
        if (thinkingMessage) {
            await thinkingMessage.delete().catch(err => console.log('Failed to delete thinking message:', err));
        }
        // message.reply('Sorry, there was an error processing your request.');
    }
});

client.login(TOKEN);