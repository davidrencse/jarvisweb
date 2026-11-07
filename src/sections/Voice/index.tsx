import { SectionHead } from "../../components/SectionHead";
import { VoiceCheck } from "./VoiceCheck";

export default function Voice() {
  return (
    <section id="voice" aria-labelledby="voice-title" style={{ paddingBlock: "var(--section-y)" }}>
      <div className="container">
        <SectionHead
          id="voice-title"
          layout="split"
          title={"It only answers\nto you."}
          lede="While it listens, JARVIS checks the voice against yours. A stranger’s words are dropped unread, and nothing happens without “Jarvis” up front. Try both below."
        />
        <VoiceCheck />
      </div>
    </section>
  );
}
