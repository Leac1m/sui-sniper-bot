// import { checkForNewPools } from '@/services/tokenWatcher';
// import { snipe } from '@/services/snipeService';

// export async function startSniperLoop(userId: number, targetToken: string, amount: number) {
//   console.log(`👀 Watching for token: ${targetToken}`);

//   setInterval(async () => {
//     try {
//       await checkForNewPools(async (event) => {
//         const matchedToken = event?.events?.[0]?.parsedJson?.coin_type;
//         if (matchedToken?.toLowerCase() === targetToken.toLowerCase()) {
//           console.log(`🎯 Match found for token ${matchedToken}`);
//           const digest = await snipe(userId, targetToken, amount); // recipient = token?
//           console.log(`✅ Sniped! Tx digest: ${digest}`);
//         }
//       });
//     } catch (e) {
//       console.error('Sniper error:', e);
//     }
//   }, 5000);
// }
