import Link from "next/link";
import { Activity, ArrowRight, Database, ShieldCheck, Zap } from "lucide-react";
import { GhostSubMark } from "@/components/GhostSubMark";

const stages = [
  {
    number: "01",
    icon: Database,
    label: "Remember usage",
    title: "A clear record of activity",
    description:
      "Your billing preference is saved to Walrus Memory, so every visit starts from the choice you made.",
  },
  {
    number: "02",
    icon: Activity,
    label: "Spot the idle",
    title: "Catch the quiet subscriptions",
    description:
      "When usage falls below your learned floor, GhostSub flags the subscription and recommends a billing policy.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    label: "Pay as you use",
    title: "Keep the service available",
    description:
      "Access continues through per-request x402 payments, priced in USDC as the service is used.",
  },
];

export default function Home() {
  return (
    <div className="landing-page-shell min-h-screen">
      <header className="site-header">
        <div className="site-nav">
          <Link href="/" className="brand-mark" aria-label="GhostSub home">
            <GhostSubMark className="brand-symbol" />
            <span>GhostSub</span>
          </Link>
          <nav className="primary-nav" aria-label="Main navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#infrastructure">Infrastructure</a>
          </nav>
          <div className="nav-actions">
            <span className="nav-status"><i /> Sui Mainnet</span>
            <Link href="/demo" className="nav-cta">Open the demo <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="landing-hero">
          <div className="hero-content">
            <h1>Stop paying for<br className="hidden sm:block" /> work that isn’t happening.</h1>
            <p>GhostSub learns when a subscription has gone idle from the calls you keep and reverse, then recommends metered billing or a pause.</p>
            <div className="hero-actions">
              <Link href="/demo" className="hero-cta">Explore the live demo <ArrowRight size={16} aria-hidden="true" /></Link>
              <a href="#how-it-works" className="hero-text-link">See how it works</a>
            </div>

            <div className="floor-readout">
              <div className="floor-readout-head">
                <span className="floor-readout-label">Learned usage floor</span>
                <span className="floor-readout-live"><i className="proof-dot" /> Walrus Mainnet</span>
              </div>
              <div className="floor-track">
                <span className="floor-line" aria-hidden="true" />
                <span className="floor-step" style={{ left: "6%" }}><i /><span>20.0%</span></span>
                <span className="floor-step" style={{ left: "50%" }}><i /><span>15.7%</span></span>
                <span className="floor-step floor-step-current" style={{ left: "94%" }}><i /><span>12.8%</span></span>
              </div>
              <div className="floor-readout-foot">
                <p>Two reversed calls recalled from memory moved the floor down</p>
                <span className="floor-blobs">
                  <code>INxQdmVZn3fk…</code>
                  <code>bNyFLu2JoX9…</code>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-process" id="how-it-works">
          <div className="landing-process-heading">
            <div>
              <span className="section-kicker">A calmer way to manage recurring spend</span>
              <h2>Keep the useful.<br />Let go of the idle.</h2>
            </div>
            <p>GhostSub brings a saved billing preference, a sample policy decision, and a payment preview into one simple walkthrough.</p>
          </div>
          <div className="landing-steps">
            {stages.map(({ number, icon: Icon, label, title, description }) => (
              <article className="landing-step" key={number}>
                <div className="landing-step-top">
                  <span className="landing-step-number">{number}</span>
                  <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <span className="landing-step-label">{label}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
          <p className="landing-note">Prototype: the usage timeline is sample data, and this build sends no Sui payment. The demo previews requests and never submits a transaction.</p>
        </section>

        <section className="landing-infrastructure" id="infrastructure">
          <div className="infrastructure-copy">
            <span className="section-kicker">Built for autonomous software</span>
            <h2>Usage memory meets machine payments.</h2>
            <p>GhostSub keeps preference and activity records in Walrus Memory. Walk through a simulated policy decision and an HTTP 402 payment preview.</p>
          </div>
          <Link href="/demo" className="hero-cta">Open the interactive demo <ArrowRight size={16} aria-hidden="true" /></Link>
          <div className="infrastructure-rail" aria-hidden="true">
            <span>WALRUS MEMORY</span><i /><span>POLICY INTERCEPT</span><i /><span>SUI x402</span>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <Link href="/" className="brand-mark" aria-label="GhostSub home">
          <GhostSubMark className="brand-symbol" /><span>GhostSub</span>
        </Link>
        <span>Autonomous subscription monitoring on Sui.</span>
        <Link href="/demo" className="footer-demo-link">Try the demo <ArrowRight size={13} aria-hidden="true" /></Link>
      </footer>
    </div>
  );
}
