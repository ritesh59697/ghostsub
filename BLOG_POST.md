# GhostSub: remembering the policy behind an underused subscription

*A prototype for the Total Recall hackathon by Tatum and Walrus Memory.*

Subscription tools often treat low usage as a simple cancellation signal. But low usage does not tell the whole story: someone may still need occasional access, while someone else may be happy to pause a plan when it sits idle. GhostSub explores a small but useful question for a finance agent: can it remember the user's policy, then make that preference visible when the next decision comes around?

## A preference changes the recommendation

GhostSub presents a 30-day sample timeline for one fictional API subscription. Usage falls below a modeled 20% floor on Day 14. At that point, the app can recommend either keeping access through metered billing or pausing the flat plan. The difference comes from a billing policy selected in the demo, rather than from treating every quiet period the same way.

This walkthrough uses illustrative activity, not a connected account or a person's real subscription history. The savings figures are modeled examples. No subscription is canceled and no payment is sent.

## Walrus Memory makes the preference persistent

When the visitor saves a policy, the server writes a structured preference to Walrus Memory using the Walrus Memory SDK (`memwal`). The app waits for Walrus to return a blob ID before marking the write verified. On a later load, GhostSub recalls preference records from the current browser-local demo profile and uses the latest saved policy to update the Day 14 recommendation. The Memory Ledger exposes the receipts so the persistence is inspectable.

The current profile contains ten confirmed Walrus Mainnet blob receipts: nine synthetic policy scenarios and one earlier payment-preview event. The scenarios are explicitly labeled as synthetic examples; they are not inferred facts about the profile owner. They demonstrate the storage and recall path, not autonomous learning from real usage.

## Tatum provides a live Sui network read

GhostSub also queries Tatum's Sui GraphQL endpoint for the latest checkpoint. The read is used as network status context in the demo. It does not submit a transaction. The API key stays server-side, and the interface distinguishes this live RPC read from the sample subscription timeline.

## What works today, and what does not

The prototype demonstrates a persistent preference loop: choose a policy, store it in Walrus, recall it for the demo profile, and see it change a recommendation. It also includes an HTTP 402 wire preview to explain how usage-based billing could be represented.

That panel is only a preview. There is no wallet approval, payment recipient, signed payload, or on-chain settlement in this build. Likewise, the app does not connect to a real subscription provider or cancel a plan. These are deliberate boundaries so the demo can show what has been integrated without implying that future steps already work.

## Next steps

The next milestone is a public deployment with server-side Tatum and Walrus configuration, followed by a recorded walkthrough and a real service/payment flow with explicit user approval. For the hackathon submission, the live demo and this post should be paired with the public source repository.

**Project:** GhostSub — a memory-aware subscription finance prototype

**Source:** [github.com/ritesh59697/ghostsub](https://github.com/ritesh59697/ghostsub)

**Published post:** [GhostSub: remembering the policy behind an underused subscription](https://medium.com/@riteshwork5969/ghostsub-remembering-the-policy-behind-an-underused-subscription-7b061ddf32d3)

**Demo:** pending public deployment
