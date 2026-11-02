# GhostSub demo recording plan

**Target length:** 2:30
**Recording route:** `/demo`
**Goal:** Show memory *changing the agent's threshold* before the first minute — not just persisting a setting — then prove the receipts and explain the integrations accurately.

## Before recording

1. Start the local production server with `npm run start` (or use the deployed demo once available).
2. Open `/demo` at desktop width and wait for the Tatum and Walrus status indicators to settle.
3. Confirm the page shows the verified write count, the latest Tatum checkpoint, and the decision-day recommendation from the recalled `keep_access` preference.
4. Close unrelated tabs and hide personal desktop notifications. Use the public deployment for the final submission recording.
5. Note the **Learned usage floor** panel's starting value before recording, so the change at 0:45 is visible on camera.
6. Each outcome click writes a real Walrus Mainnet blob and takes up to 45 seconds to confirm. Record in one take and wait for the floor to update, or pre-roll one click so the panel already shows learned history.

## Timed walkthrough

| Time | On-screen action | Narration |
| --- | --- | --- |
| **0:00–0:15** | Start at the demo heading and show the status row. | “GhostSub is a prototype for subscription decisions that remember the user's policy. This screen uses a sample subscription timeline, with a live read-only Sui checkpoint from Tatum and persistent policy memory from Walrus.” |
| **0:15–0:45** | Show the 30-day timeline and move to the decision day. Point to the current usage floor and the metered recommendation. | “By the decision day, this fictional API subscription has fallen below its current activity floor. The saved policy says to keep access, so GhostSub recommends metered billing instead of treating low use as an automatic cancellation signal. Where that floor comes from is the interesting part.” |
| **0:45–1:15** | Point to the **Learned usage floor** panel, then click **No, too early**. Wait for the floor to drop and the rationale to update. | “Here is the part that is actually memory rather than storage. The floor that decides whether a subscription is underused is not a constant in the code — it is recomputed from past outcomes. When I reject this call, that outcome is written to Walrus Mainnet, the floor moves down, and the rationale now cites the recalled history. The next recommendation is different because of what the agent remembers.” |
| **1:15–1:35** | Open the Memory Ledger. Show the verified receipts, including the outcome just written. | “Every entry here is a confirmed Walrus Mainnet blob. The seeded scenarios are labeled as synthetic examples; the outcome I just created is a real receipt from this session. Re-reading the floor after a restart reconstructs it from these blobs, so nothing is cached server-side.” |
| **1:35–1:50** | Open the x402 / MPP wire preview. | “This panel illustrates the shape of an HTTP 402 request for a possible metered service. This build does not connect a wallet or send a payment; there is no settlement transaction to claim.” |
| **1:50–2:10** | Show Tatum network status and the architecture view. Optionally show `/api/ledger` in a second tab. | “Tatum supplies the latest Sui checkpoint through a server-side read. Walrus holds the policy and the outcome history. A public ledger endpoint reports the durable Mainnet memory count, so the receipts are verifiable without opening the demo. The usage timeline itself remains sample data.” |
| **2:10–2:30** | Finish on a clean project end card with public demo and repository URLs. | “GhostSub shows memory doing more than persistence: the threshold the agent acts on is learned from decisions the user accepted or rejected. The next steps are real usage telemetry and an explicitly approved payment flow. The source and live demo are linked here.” |

## End card details

- **Project:** GhostSub — memory-aware subscription finance prototype
- **Repository:** https://github.com/ritesh59697/ghostsub
- **Live demo:** https://ghostsub-cyan.vercel.app/demo
- **Blog post:** https://medium.com/@riteshwork5969/ghostsub-remembering-the-policy-behind-an-underused-subscription-7b061ddf32d3

## Capture notes

- Keep the recommendation and status labels readable; avoid fast scrolling.
- Prefer a clean browser window and narration or accurate captions.
- Use a local screen recording utility such as QuickTime Player on macOS, selecting only the browser window where possible.
- Upload the recording only after replacing local-only references and confirming the public demo URL works.
