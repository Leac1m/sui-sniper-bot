import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';

// Load environment variables from .env file
dotenv.config();


export const config = {
    mongodb: {
        uri: process.env.MONGODB_URI!,
    },
    sui: {
        network: process.env.SUI_NETWORK || 'mainnet',
    },
    telegram: {
        token: process.env.BOT_TOKEN!,
    },
    api: {
        bodyParser: true
    }
};

// Validate required environment variables
const validateConfig = () => {
    const required = ['MONGODB_URI', 'BOT_TOKEN'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

validateConfig();

const bot = new Telegraf(config.telegram.token)

export function getBot() { return bot; }