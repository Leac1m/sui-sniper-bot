import { getBot } from '../config/environment'

const bot = getBot()

// const commands = [
//     ['start', 'Start the bot'],
//     ['help', 'Show help menu'],
//     ['createwallet', 'Create a new SUI wallet'],
//     ['importwallet', 'Import an exising wallet using the private key'],
// ]

async function setCommands() {
    await bot.telegram.setMyCommands([
    { command: 'start', description: 'Start the bot' },
    { command: 'help', description: 'Show help menu' },
    { command: 'createwallet', description: 'Create a new SUI wallet' },
    { command: 'importwallet', description: 'import your SUI wallet using' },
    { command: 'mywallet', description: 'Details about my wallet' },
    { command: 'balance', description: 'Show wallet balance' },
    { command: 'transfer', description: 'Transfer coins coins accross wallet' },
  ]);
}

setCommands();