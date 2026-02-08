declare module "canvas-confetti" {
  type ConfettiOptions = {
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: Array<"square" | "circle">;
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  };

  type ConfettiFn = (opts?: ConfettiOptions) => void;

  const confetti: ConfettiFn;
  export default confetti;
}
