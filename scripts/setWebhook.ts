// /scripts/setWebhook.ts
import { Telegraf } from 'telegraf';
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN!);
const endpoint = process.env.ENDPOINT

if (!endpoint) throw new Error("You haven't added the endpoint url");

const URL = `https://${endpoint}/api/telegram`;

bot.telegram.setWebhook(URL).then(() => {
  console.log(`Webhook set to ${URL}`);
});