import { FadeIn } from "../../components/FadeIn";
import { SectionHead } from "../../components/SectionHead";
import { VisionViewer } from "../../components/vision/VisionViewer";
import { CONSOLE_SHOTS } from "./shots";
import styles from "./Console.module.css";

export default function Console() {
  return (
    <section id="console" aria-labelledby="console-title" className={`inverse ${styles.section}`}>
      <div className="container">
        <SectionHead
          id="console-title"
          layout="split"
          inverse
          title={"Eight views of\nthe real console."}
          lede="Each one is a capture of the running console on 7 November 2026, not a mock-up. Move over a capture to put it under the lens, pick a numbered part to isolate it, or switch to the edge view to see the layout the way a detector would."
        />
        <FadeIn y={24} amount={0.15} className={styles.stage}>
          <VisionViewer shots={CONSOLE_SHOTS} label="Console views" />
        </FadeIn>
        <p className={styles.note}>
          Captured from the console at 127.0.0.1:7777 on the Zenbook. Private folder and chat contents on the Dell are
          blurred. “Mic blocked” appears only because the capture browser refuses the microphone.
        </p>
      </div>
    </section>
  );
}
