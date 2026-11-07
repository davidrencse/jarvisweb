import { lazy, Suspense, useEffect } from "react";
import { Nav } from "./components/Nav";
import { ScrollIsland } from "./components/scroll-island";
import { interceptHashLinks, scrollToId } from "./lib/scroll";
import Hero from "./sections/Hero";
import Console from "./sections/Console";
import Cluster from "./sections/Cluster";
import Voice from "./sections/Voice";
import Pipeline from "./sections/Pipeline";
import Memory from "./sections/Memory";
import Knowledge from "./sections/Knowledge";
import Actions from "./sections/Actions";
import Cost from "./sections/Cost";
import Everywhere from "./sections/Everywhere";
import Principles from "./sections/Principles";
import Faq from "./sections/Faq";
import EarlyAccess from "./sections/EarlyAccess";
import Footer from "./sections/Footer";

const loadTerminal = () => import("./sections/Terminal");
const Terminal = lazy(loadTerminal);

/** Holds the anchor and the space while a below-the-fold section's code loads. */
function Reserve({ id, height }: { id: string; height: number }) {
  return <section id={id} aria-busy="true" style={{ minHeight: height }} />;
}

const TOPICS = [
  { id: "terminal", title: "The terminal" },
  { id: "console", title: "The console" },
  { id: "cluster", title: "Every computer" },
  { id: "voice", title: "Voice check" },
  { id: "how", title: "How it works" },
  { id: "memory", title: "Memory" },
  { id: "knowledge", title: "Knowledge engine" },
  { id: "actions", title: "Actions" },
  { id: "cost", title: "Cost and routing" },
  { id: "everywhere", title: "Ways to use it" },
  { id: "privacy", title: "Privacy" },
  { id: "faq", title: "Questions" },
];

export default function App() {
  useEffect(() => interceptHashLinks(), []);

  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    let live = true;
    loadTerminal().then(() =>
      requestAnimationFrame(() => requestAnimationFrame(() => live && scrollToId(id, { instant: true }))),
    );
    return () => {
      live = false;
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Suspense fallback={<Reserve id="terminal" height={1400} />}>
          <Terminal />
        </Suspense>
        <Console />
        <Cluster />
        <Voice />
        <Pipeline />
        <Memory />
        <Knowledge />
        <Actions />
        <Cost />
        <Everywhere />
        <Principles />
        <Faq />
        <EarlyAccess />
      </main>
      <Footer />
      <ScrollIsland
        topics={TOPICS}
        showAfter="top"
        hideAt="access"
        cta={{ href: "#access", label: "Request early access" }}
      />
    </>
  );
}
