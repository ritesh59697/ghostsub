import Link from "next/link";
import { Activity, ArrowRight, Database, ShieldCheck, Zap } from "lucide-react";
import { GhostSubMark } from "@/components/GhostSubMark";

const stages = [
  {
    number: "01",
    icon: Database,
    label: "Remember usage",
    title: "A clear record of activity.",
    description:
      "The prototype stores a chosen billing preference with Walrus Memory when configured; its usage timeline is sample data.",
  },
  {
    number: "02",
    icon: Activity,
    label: "Spot the idle",
    title: "Catch the quiet subscriptions.",
    description:
      "The sample timeline applies the selected policy below a threshold and shows a recommendation. It does not change a subscription.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    label: "Pay as you use",
    title: "Keep the service available.",
    description:
      "An HTTP 402 preview illustrates a possible per-request flow. This build does not submit a Sui payment.",
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
          <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
          <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
          <div className="hero-content">
            <Link className="hero-announcement" href="/demo">
              <span>Introducing GhostSub</span><ArrowRight size={13} aria-hidden="true" />
            </Link>
            <h1>Stop paying for<br className="hidden sm:block" /> work that isn’t happening.</h1>
            <p>GhostSub models what could happen when subscription usage falls away: preserve access with metered billing, or pause the flat plan.</p>
            <div className="hero-actions">
              <Link href="/demo" className="hero-cta">Explore the live demo <ArrowRight size={16} aria-hidden="true" /></Link>
              <a href="#how-it-works" className="hero-text-link">See how it works</a>
            </div>
            <div className="hero-proof"><span className="proof-dot" /> Designed for Sui <span className="proof-separator">·</span> Walrus Memory preference demo <span className="proof-separator">·</span> HTTP 402 preview</div>
          </div>
          <div className="hero-constellation" aria-hidden="true">
            <div className="constellation-core"><span /><span /><span /><span /><span /><span /><span /></div>
            <div className="constellation-node node-left" /><div className="constellation-node node-right" />
            <div className="constellation-line line-left" /><div className="constellation-line line-right" />
          </div>
          <div className="hero-horizon" aria-hidden="true" />
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
                  <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
                </div>
                <span className="landing-step-label">{label}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-infrastructure" id="infrastructure">
          <div className="infrastructure-copy">
            <span className="section-kicker">Built for autonomous software</span>
            <h2>Usage memory meets machine payments.</h2>
            <p>GhostSub is a prototype using Walrus Memory for preference and activity records. Explore the walkthrough to see a simulated policy decision and an HTTP 402 payment preview.</p>
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
