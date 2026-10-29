# Total Recall hackathon submission brief

## Event

- **Event:** Total Recall — Tatum × Walrus Memory
- **Deadline:** November 10, 2026 at 17:00 UTC (22:30 India Standard Time)
- **Official brief and current rules:** https://recall-tatum-walrus.vercel.app/
- **Project:** GhostSub, a memory-aware subscription finance prototype
- **Repository:** https://github.com/ritesh59697/ghostsub
- **Public demo:** https://ghostsub-cyan.vercel.app/demo

## Requirements from the official brief

- Use Walrus Memory on Mainnet.
- Use Tatum RPC for on-chain data where relevant.
- Have at least 10 memories on Mainnet.
- Publish a blog post explaining the project, how Tatum and Walrus are used, and how it learns/remembers.
- Provide a working demo and public repository.
- Tatum AI Builder is optional and has its own special award.

## Judging

| Criterion | Weight |
| --- | ---: |
| Walrus and Tatum integration | 30% |
| Technical quality | 30% |
| Creativity | 20% |
| Presentation | 20% |

## Tracks and awards relevant to GhostSub

- **Consumer Finance Apps:** subscription management with learned spend limits is a relevant track fit. Confirm final category naming and prize details on the official page before submitting.
- **Best Walrus Memory:** relevant because a recalled billing policy changes the product recommendation.
- **Best Tatum AI Builder App:** optional; requires building primarily with Tatum AI Builder.
- **Best Use of Agent Payments:** relevant only if GhostSub implements a real, user-approved payment flow. The current HTTP 402 view is a preview and does not qualify as settlement evidence.

The official page lists three $500 special awards: Best Walrus Memory, Best Tatum AI Builder, and Best Use of Agent Payments. Check the linked brief again before submission in case details change.

## Current evidence and honest scope

- Ten Walrus Mainnet blob receipts are confirmed in the current demo profile: nine explicitly synthetic policy scenarios and one payment-preview event.
- The demo can recall profile memories after a reload and show the saved policy changing the Day 14 recommendation.
- Tatum provides a live, read-only Sui latest-checkpoint query.
- The 30-day usage timeline and savings are illustrative sample data.
- No actual subscription account is connected, no subscription is canceled, and no Sui payment is signed or broadcast.

## Submission checklist

- [x] Public source repository
- [x] Walrus Memory Mainnet integration and 10 confirmed blob receipts
- [x] Tatum Sui RPC checkpoint read
- [x] Interactive demo flow and inspectable Memory Ledger
- [x] Published blog post: https://medium.com/@riteshwork5969/ghostsub-remembering-the-policy-behind-an-underused-subscription-7b061ddf32d3
- [x] Timed recording plan: `DEMO_SCRIPT.md`
- [x] Deploy the app and confirm Tatum latest-checkpoint and Walrus health responses in Production
- [x] Publish the blog
- [x] Add the public demo URL to the blog and project notes
- [ ] Record and publish a 2–3 minute walkthrough
- [ ] Final review against the current official rules
