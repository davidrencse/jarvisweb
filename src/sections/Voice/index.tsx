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
          lede="Before a single word is transcribed, JARVIS checks the voice against yours. Strangers aren't written down and aren't answered. Try both below."
        />
        <VoiceCheck />
      </div>
    </section>
  );
}
