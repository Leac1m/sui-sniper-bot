import { faucet, getSuiBalance } from "@/services/balanceService";
import { createWallet, getWalletByTelegramId, importWallet } from "@/services/walletService";
import { Context } from "telegraf";
import { clearPendingTransfer, getPendingTransfer, setPendingTransfer, } from "../TransferCache";
import { snipe } from "@/services/snipeService";


export const handleCreateWallet = async (ctx: Context) => {
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
}

export const handleImportWallet = async (ctx: Context) => {
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
}

export const handleMyWallet = async (ctx: Context) => {
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
}

export const handleBalance = async (ctx: Context) => {
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
}

export const handleTranfer = async (ctx: Context) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return ctx.reply('❌ Telegram ID not found.');

    const input = ctx.message?.text?.split(' ') ?? [];
    if (input.length !== 3) {
        return ctx.reply('⚠️ Usage:\n/transfer <recipient_address> <amount>');
    }

    const recipient = input[1].trim();
    const amount = parseFloat(input[2]);
    if (isNaN(amount) || amount <= 0) return ctx.reply('⚠️ Invalid amount.');

    setPendingTransfer(telegramId, { recipient, amount });

    ctx.reply(`📝 Sniping request saved:\nTo: \`${recipient}\`\nAmount: ${amount} SUI\n\nType /confirm to execute or /cancel to cancel.`, {
        parse_mode: 'Markdown',
    });
}

export const handleComfirmTransfer = async (ctx: Context) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return ctx.reply('❌ Telegram ID not found.');

  const pending = getPendingTransfer(telegramId);
  if (!pending) return ctx.reply('⚠️ No pending transfers. Use /snipe to prepare a transaction.');

  try {
    const digest = await snipe(telegramId, pending.recipient, pending.amount);

    ctx.reply(`✅ transfer confirmed and executed!\n🔗 Transaction Digest: \`${digest}\``, {
      parse_mode: 'Markdown',
    });
  } catch (err) {
    console.error('Confirm failed:', err);
    // ctx.reply('❌ Failed to execute snipe.');
    ctx.reply(`❌ transfer failed: ${err instanceof Error ? err.message : 'Unknown error'}`);

  } finally {
    clearPendingTransfer(telegramId);
  }
}

export const handleCancelTransfer = async (ctx: Context) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return ctx.reply('❌ Telegram ID not found.');

  const pending = getPendingTransfer(telegramId);
  if (!pending) {
    return ctx.reply('⚠️ No pending transfers to cancel.');
  }

  clearPendingTransfer(telegramId);
  ctx.reply('❌ Your pending transfer has been cancelled.');
}

export const handleFaucet = async (ctx: Context) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return ctx.reply('❌ Telegram ID not found.');

    const result = await faucet(telegramId);
    if (result.success)
        return ctx.reply(`${result.message}`)
    
    return ctx.reply(`⚠️ ${result.message}`)
}