// /pages/api/telegram.ts
import { Telegraf } from 'telegraf';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createWallet } from '@/services/walletService';
import { importWallet } from '@/services/walletService';
import { getWalletByTelegramId } from '@/services/walletService';
import { getSuiBalance } from '@/services/balanceService';
import { snipe } from '@/services/snipeService';

// import { startSniperLoop } from '@/bot/sniperJob';
import { setPendingSnipe, getPendingSnipe, clearPendingSnipe } from '@/bot/snipeCache';



const bot = new Telegraf(process.env.BOT_TOKEN!);

// Sample command
bot.start((ctx) => ctx.reply('Welcome to Sui Sniper Bot!'));

bot.command('createwallet', async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return ctx.reply('User ID not found.');
  
    try {
      const { address } = await createWallet(telegramId);
      ctx.reply(`✅ Wallet created!\n\n📬 Address: \`${address}\``, {
        parse_mode: 'Markdown'
      });
    } catch (err) {
      console.error('Wallet creation failed:', err);
      ctx.reply('❌ Failed to create wallet.');
    }
  });
  
bot.command('importwallet', async (ctx) => {
    const telegramId = ctx.from?.id;
    const input = ctx.message?.text?.split(' ') ?? [];
  
    if (!telegramId) return ctx.reply('❌ Telegram ID not found.');
    if (input.length < 2) return ctx.reply('⚠️ Please provide your private key.\nExample: /importwallet BASE64_KEY');
  
    const privateKey = input[1].trim();
  
    try {
      const { address } = await importWallet(telegramId, privateKey);
      ctx.reply(`✅ Wallet imported successfully!\n📬 Address: \`${address}\``, {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('Import error:', error);
      ctx.reply('❌ Failed to import wallet. Please ensure the private key is valid.');
    }
});

bot.command('mywallet', async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return ctx.reply('❌ Telegram ID not found.');

  try {
    const wallet = await getWalletByTelegramId(telegramId);

    if (!wallet) {
      return ctx.reply('⚠️ No wallet found. Use /createwallet or /importwallet first.');
    }

    ctx.reply(
      `🔐 Your wallet address:\n\`${wallet.address}\`\n\n🗓️ Created: ${wallet.createdAt?.toDateString() ?? 'N/A'}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Error fetching wallet:', error);
    ctx.reply('❌ Failed to retrieve wallet.');
  }
});


bot.command('balance', async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return ctx.reply('❌ Telegram ID not found.');

  try {
    const balanceInfo = await getSuiBalance(telegramId);

    if (!balanceInfo) {
      return ctx.reply('⚠️ No wallet found. Use /createwallet or /importwallet first.');
    }

    const suiAmount = Number(balanceInfo.totalBalance) / 1e9;

    ctx.reply(
      `💰 Balance for \`${balanceInfo.address}\`:\n\nSUI: ${suiAmount.toFixed(6)}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Balance fetch failed:', error);
    ctx.reply('❌ Failed to fetch SUI balance. Please try again later.');
  }
});


bot.command('snipe', async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return ctx.reply('❌ Telegram ID not found.');

  const input = ctx.message?.text?.split(' ') ?? [];
  if (input.length !== 3) {
    return ctx.reply('⚠️ Usage:\n/snipe <recipient_address> <amount>');
  }

  const recipient = input[1].trim();
  const amount = parseFloat(input[2]);
  if (isNaN(amount) || amount <= 0) return ctx.reply('⚠️ Invalid amount.');

  setPendingSnipe(telegramId, { recipient, amount });

  ctx.reply(`📝 Sniping request saved:\nTo: \`${recipient}\`\nAmount: ${amount} SUI\n\nType /confirm to execute or /cancel to cancel.`, {
    parse_mode: 'Markdown',
  });
});


bot.command('confirm', async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return ctx.reply('❌ Telegram ID not found.');

  const pending = getPendingSnipe(telegramId);
  if (!pending) return ctx.reply('⚠️ No pending snipe. Use /snipe to prepare a transaction.');

  try {
    const digest = await snipe(telegramId, pending.recipient, pending.amount);

    ctx.reply(`✅ Snipe confirmed and executed!\n🔗 Transaction Digest: \`${digest}\``, {
      parse_mode: 'Markdown',
    });
  } catch (err) {
    console.error('Confirm failed:', err);
    ctx.reply('❌ Failed to execute snipe.');
    // ctx.reply(`❌ Snipe failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

  } finally {
    clearPendingSnipe(telegramId);
  }
});


bot.command('cancel', async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return ctx.reply('❌ Telegram ID not found.');

  const pending = getPendingSnipe(telegramId);
  if (!pending) {
    return ctx.reply('⚠️ No pending snipe to cancel.');
  }

  clearPendingSnipe(telegramId);
  ctx.reply('❌ Your pending snipe has been cancelled.');
});


// bot.command('autosnipe', async (ctx) => {
//   const telegramId = ctx.from?.id;
//   const input = ctx.message?.text?.split(' ') ?? [];

//   if (!telegramId) return ctx.reply('❌ Telegram ID not found.');
//   if (input.length !== 3) return ctx.reply('⚠️ Usage:\n/autosnipe <token_address> <amount>');

//   const token = input[1].trim();
//   const amount = parseFloat(input[2]);

//   if (!/^0x[a-fA-F0-9]{64}$/.test(token)) {
//     return ctx.reply('⚠️ Invalid token address format.');
//   }

//   if (isNaN(amount) || amount <= 0) {
//     return ctx.reply('⚠️ Invalid amount.');
//   }

//   try {
//     ctx.reply(`🔎 Watching for token: \`${token}\`\nAuto-snipe will trigger at ${amount} SUI.`, {
//       parse_mode: 'Markdown'
//     });
//     await startSniperLoop(telegramId, token, amount);
//   } catch (err) {
//     console.error(err);
//     ctx.reply('❌ Failed to start auto-sniper.');
//   }
// });


   
export const config = {
  api: { bodyParser: true },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {

    await bot.handleUpdate(req.body);
    return res.status(200).end();
  }
  res.status(405).end();
}
