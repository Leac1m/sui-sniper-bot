import type { NextApiRequest, NextApiResponse } from 'next';

// import { startSniperLoop } from '@/bot/sniperJob';
import { handleBalance, handleCancelTransfer, handleComfirmTransfer, handleCreateWallet, handleFaucet, handleImportWallet, handleMyWallet, handleTranfer } from '@/bot/commands';
import { getBot } from '@/config/environment';



const bot = getBot();

bot.start((ctx) => ctx.reply('Welcome to Sui Sniper Bot!'));

bot.command('createwallet', handleCreateWallet);

bot.command('importwallet', handleImportWallet);

bot.command('mywallet', handleMyWallet);

bot.command('balance', handleBalance);

bot.command('transfer', handleTranfer);

bot.command('confirm', handleComfirmTransfer);

bot.command('cancel', handleCancelTransfer);

bot.command('faucet', handleFaucet);


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

// export const config = {
//   api: {
//     bodyParser: true,
//   }
// };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {

    await bot.handleUpdate(req.body);
    return res.status(200).end();
  }
  res.status(405).end();
}

export { getBot }