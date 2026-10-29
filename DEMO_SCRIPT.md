# GhostSub demo recording plan

**Target length:** 2:30
**Recording route:** `/demo`
**Goal:** Show the persistent memory changing a product decision before the first minute, then prove the receipts and explain the integrations accurately.

## Before recording

1. Start the local production server with `npm run start` (or use the deployed demo once available).
2. Open `/demo` at desktop width and wait for the Tatum and Walrus status indicators to settle.
3. Confirm the page shows **10 verified writes**, the latest Tatum checkpoint, and the Day 14 recommendation from the recalled `keep_access` preference.
4. Close unrelated tabs and hide personal desktop notifications. Use the public deployment for the final submission recording.
5. Keep this profile as-is during recording. Saving another preference creates another Walrus Mainnet blob.

## Timed walkthrough

| Time | On-screen action | Narration |
| --- | --- | --- |
| **0:00–0:15** | Start at the demo heading and show the status row. | “GhostSub is a prototype for subscription decisions that remember the user's policy. This screen uses a sample subscription timeline, with a live read-only Sui checkpoint from Tatum and persistent policy memory from Walrus.” |
| **0:15–0:45** | Show the 30-day timeline and move to Day 14. Point to the modeled usage floor and the metered recommendation. | “At Day 14, this fictional API subscription is below the modeled 20 percent activity floor. The saved policy says to keep access, so GhostSub recommends metered billing instead of treating low use as an automatic cancellation signal.” |
| **0:45–1:00** | Reveal the preference control and change it to **Pause when idle**. Show the recommendation update. Do not save it. | “A different policy produces a different answer: pause the flat plan when it is idle. This is the core memory-driven product behavior. I’m changing the local preview only; I’m not writing another memory during this recording.” |
| **1:00–1:25** | Open the Memory Ledger. Show the verified count and a few blob receipts. | “The ledger lists ten confirmed Walrus Mainnet receipts in this profile. Nine are synthetic policy scenarios and one is an earlier payment-preview event. They are clearly labeled as examples, not real personal history.” |
| **1:25–1:45** | Return to the recommendation, then open the x402 / MPP wire preview. | “This panel illustrates the shape of an HTTP 402 request for a possible metered service. This build does not connect a wallet or send a payment; there is no settlement transaction to claim.” |
| **1:45–2:05** | Show Tatum network status and the architecture view. | “Tatum supplies the latest Sui checkpoint through a server-side GraphQL read. Walrus stores and recalls the selected policy. The timeline and savings remain sample data, separate from those network integrations.” |
| **2:05–2:30** | Finish on a clean project end card with public demo and repository URLs. | “GhostSub demonstrates how persistent memory can make a finance recommendation reflect a user's chosen policy. The next step is a deployed version and, separately, an explicitly approved payment flow. The source and live demo are linked here.” |

## End card details

- **Project:** GhostSub — memory-aware subscription finance prototype
- **Repository:** https://github.com/ritesh59697/ghostsub
- **Live demo:** replace with the deployed `/demo` URL before publishing
- **Blog post:** replace with its published URL before publishing

## Capture notes

- Keep the recommendation and status labels readable; avoid fast scrolling.
- Prefer a clean browser window and narration or accurate captions.
- Use a local screen recording utility such as QuickTime Player on macOS, selecting only the browser window where possible.
- Upload the recording only after replacing local-only references and confirming the public demo URL works.
