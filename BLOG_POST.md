# GhostSub: remembering the policy behind an underused subscription

*A prototype for the Total Recall hackathon by Tatum and Walrus Memory.*

Subscription tools often treat low usage as a simple cancellation signal. But low usage does not tell the whole story: someone may still need occasional access, while someone else may be happy to pause a plan when it sits idle. GhostSub explores a small but useful question for a finance agent: can it learn the user's policy from the decisions they accept and reject, rather than asking them to configure a threshold up front?

## A preference changes the recommendation

GhostSub presents a 30-day sample timeline for one fictional API subscription. Usage falls below a usage floor partway through the month. At that point, the app can recommend either keeping access through metered billing or pausing the flat plan. The difference comes from a billing policy selected in the demo, rather than from treating every quiet period the same way.

This walkthrough uses illustrative activity, not a connected account or a person's real subscription history. The savings figures are modeled examples. No subscription is canceled and no payment is sent.

## Walrus Memory makes the preference persistent

When the visitor saves a policy, the server writes a structured preference to Walrus Memory using the Walrus Memory SDK (`memwal`). The app waits for Walrus to return a blob ID before marking the write verified. On a later load, GhostSub recalls preference records from the current browser-local demo profile and uses the latest saved policy to update the Day 14 recommendation. The Memory Ledger exposes the receipts so the persistence is inspectable.

The scenarios seeded into the ledger are explicitly labeled as synthetic examples; they are not inferred facts about the profile owner.

## The floor is learned, not configured

A stored preference on its own is just a setting. The more interesting question is where the *threshold* comes from — the usage level below which a subscription counts as underused. In the first version of this prototype that number was a constant in the source, which meant recalling more history never changed what the product did.

It is now derived from memory. Every time the user accepts or rejects a recommendation, GhostSub writes a structured outcome to Walrus Mainnet:

```
GHOSTSUB_OUTCOME_V1: reversed
preference=pause_when_idle
usage=8.4
floor=20.0
day=14
recommendation=pause_flat_plan
```

On each read, those outcomes are recalled and folded forward into a floor:

- **A reversed pause** means the call fired too aggressively — the user still wanted the service — so the floor moves *down* toward the usage that triggered it.
- **A reversed metered route** means it fired too late, so the floor moves *up*.
- **A confirmation** tightens the floor toward the level that proved correct.

The result is clamped to a 5–45% band so a run of one-sided feedback cannot push it somewhere useless. Because the floor is what decides whether usage counts as underused, moving it changes the recommendation itself.

Here is the loop running against Walrus Mainnet, with the real blob IDs:

```
no history             floor 20.0%   (starting value from the subscription record)
after one reversal     floor 15.7%   INxQdmVZn3fkChHbbko1a9nAxS3U5gqkZhKgrhZprFc
after two reversals    floor 12.8%   bNyFLu2JoX9-sh1_B8rQaHzq8xiy4iD4DR21aPy85vk
```

The important detail is that re-reading the floor after a server restart still returns those values. Nothing is cached in process memory — the learned policy is reconstructed from the blobs each time, so Walrus is not just storage here, it is where the behavior lives. Two users with different feedback histories get genuinely different recommendations from identical usage data.

## Verifying the memories

Demo memories are written to a namespace scoped to the visitor's browser profile, which means a reader who has never opened the app would see a count of zero. To make the memory count checkable independently, the app exposes a public endpoint that counts durable blobs in a configured namespace:

```bash
curl https://ghostsub-cyan.vercel.app/api/ledger
```

```json
{"configured":true,"namespaces":["ghostsub-production"],
 "verifiedMemoryCount":11,"network":"Walrus Mainnet"}
```

## Tatum provides a live Sui network read

GhostSub also queries Tatum's Sui GraphQL endpoint for the latest checkpoint. The read is used as network status context in the demo. It does not submit a transaction. The API key stays server-side, and the interface distinguishes this live RPC read from the sample subscription timeline.

## What works today, and what does not

The prototype demonstrates a closed learning loop: choose a policy, act on a recommendation, have that outcome written to Walrus, and see the recalled history move the threshold that drives the next decision. It also includes an HTTP 402 wire preview to explain how usage-based billing could be represented.

That panel is only a preview. There is no wallet approval, payment recipient, signed payload, or on-chain settlement in this build. Likewise, the app does not connect to a real subscription provider or cancel a plan.

What the system learns from is the user's feedback on its recommendations, not real metered telemetry from a connected provider. The usage timeline itself remains sample data, and the savings figures are modeled.

These are deliberate boundaries so the demo can show what has been integrated without implying that future steps already work.

## Next steps

The public demo is deployed with server-side Tatum and Walrus configuration, and the learning loop runs against Walrus Mainnet. The next milestone is connecting real usage telemetry in place of the sample timeline, and a payment flow with explicit wallet approval. For the hackathon submission, pair the live demo and this post with the public source repository.

**Project:** GhostSub — a memory-aware subscription finance prototype

**Source:** [github.com/ritesh59697/ghostsub](https://github.com/ritesh59697/ghostsub)

**Published post:** [GhostSub: remembering the policy behind an underused subscription](https://medium.com/@riteshwork5969/ghostsub-remembering-the-policy-behind-an-underused-subscription-7b061ddf32d3)

**Live demo:** [ghostsub-cyan.vercel.app/demo](https://ghostsub-cyan.vercel.app/demo)
