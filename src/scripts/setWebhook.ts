// /scripts/setWebhook.ts
import 'dotenv/config';
import { getBot } from '@/config/environment';

async function setupWebhook() {
  try {
    // Get URL from command line argument
    const webhookUrl = process.argv[2];

    if (!webhookUrl) {
      console.error('Please provide a webhook URL as an argument');
      console.error('Usage: npx ts-node scripts/setWebhook.ts <webhook-url>');
      process.exit(1);
    }

    if (!webhookUrl.startsWith('https://')) {
      throw new Error('Webhook URL must start with https://');
    }

    const bot = getBot();
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
