"use client";

import CountUp from "@/components/CountUp";
import BlurText from "@/components/BlurText";
import RotatingText from "@/components/RotatingText";
import ShinyText from "@/components/ShinyText";
import ClickSpark from "@/components/ClickSpark";

export function HeroTitle() {
  return (
    <BlurText
      text="Автозапчасти из Японии, Кореи и Китая"
      className="font-[family-name:var(--font-headline)] text-5xl lg:text-6xl font-extrabold text-[#451A03] leading-tight tracking-tight"
      delay={40}
      animateBy="words"
    />
  );
}

export function HeroBadge() {
  return (
    <ShinyText
      text="Премиум сервис в Кыргызстане"
      speed={3}
      color="#78320e"
      shineColor="#f97316"
      className="text-xs font-bold tracking-wider uppercase"
    />
  );
}

export function HeroRotating() {
  return (
    <span className="inline-flex items-center gap-2 text-lg text-on-surface-variant">
      Запчасти для{" "}
      <RotatingText
        texts={["ВАЗ", "ГАЗ", "КАМАЗ", "УАЗ", "МАЗ", "ЗИЛ", "УРАЛ"]}
        mainClassName="text-primary font-bold text-xl"
        staggerFrom="last"
        staggerDuration={0.025}
        splitLevelClassName="overflow-hidden"
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        rotationInterval={2000}
      />
    </span>
  );
}

export function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <span className="text-4xl font-extrabold font-[family-name:var(--font-headline)]">
      <CountUp to={value} duration={2} separator=" " />
      {suffix}
    </span>
  );
}

export function ClickSparkWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClickSpark sparkColor="#f97316" sparkSize={10} sparkCount={8} sparkRadius={15} duration={400}>
      {children}
    </ClickSpark>
  );
}
