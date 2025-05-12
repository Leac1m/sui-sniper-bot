// /scripts/setWebhook.ts
import { Telegraf } from 'telegraf';
import 'dotenv/config';

async function setupWebhook() {
  try {
    const bot = new Telegraf(process.env.BOT_TOKEN!);
    const endpoint = process.env.ENDPOINT?.trim();

    if (!endpoint) {
      throw new Error("ENDPOINT environment variable is not set");
    }

    // Ensure URL is properly formatted
    const webhookUrl = 'https://2ced-197-211-59-110.ngrok-free.app'
    // endpoint.startsWith('http')
    //   ? endpoint
    //   : `https://${endpoint}`;

    const URL = `${webhookUrl}/api/telegram`;

    console.log('Setting webhook to:', URL);

    const result = await bot.telegram.setWebhook(URL);
    console.log('Webhook setup result:', result);

    // Verify webhook info
    const webhookInfo = await bot.telegram.getWebhookInfo();
    console.log('Webhook info:', webhookInfo);

  } catch (error) {
    console.error('Failed to set webhook:', error);
    process.exit(1);
  }
}

setupWebhook();