"use client";

import Waves from "@/components/Waves";
import Noise from "@/components/Noise";
import DotGrid from "@/components/DotGrid";

export function WavesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <Waves
        lineColor="rgba(157, 67, 0, 0.15)"
        waveSpeedX={0.02}
        waveSpeedY={0.01}
        waveAmpX={40}
        waveAmpY={15}
        friction={0.9}
        tension={0.01}
        maxCursorMove={120}
        xGap={12}
        yGap={36}
      />
    </div>
  );
}

export function DotGridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <DotGrid
        dotSize={1.5}
        gap={25}
        baseColor="rgba(157, 67, 0, 0.15)"
        activeColor="rgba(249, 115, 22, 0.5)"
        proximity={100}
      />
    </div>
  );
}

export function NoiseOverlay() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <Noise
        patternSize={200}
        patternAlpha={10}
        patternRefreshInterval={3}
      />
    </div>
  );
}
