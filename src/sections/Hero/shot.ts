import type { MotionValue } from "motion/react";

export type ShotTheme = "light" | "dark";

export const DEG = Math.PI / 180;
export const TILT_DESKTOP = 24;
export const TILT_COMPACT = 12;

/** Camera distance in plane heights; the CSS fallback uses the same perspective (137.5cqw). */
export const CAM_DISTANCE = 2.2;
export const CAM_FOV = (2 * Math.atan(0.5 / CAM_DISTANCE)) / DEG;

/** Scale per degree of tilt that keeps the nearer edge inside the canvas: 1 - sin(t) / (2d). */
export const SCALE_PER_DEG = DEG / (2 * CAM_DISTANCE);
/** Lift per degree of tilt, in plane heights, so the tilted top edge stays near the first viewport. */
export const LIFT_PER_DEG = 0.04 / TILT_DESKTOP;

export function shotUrl(theme: ShotTheme, hi: boolean) {
  return `${import.meta.env.BASE_URL}screens/console-${theme}${hi ? "" : "-1440"}.webp`;
}

export type SceneProps = {
  theme: ShotTheme;
  tilt: MotionValue<number>;
  scale: MotionValue<number>;
  /** The canvas is on screen: start the scan reveal. */
  show: boolean;
  /** The poster was already visible, so skip the reveal. */
  skipIntro: boolean;
  /** Pointer lens enabled (mouse devices only). */
  lens: boolean;
  onReady: () => void;
  onFail: () => void;
};
