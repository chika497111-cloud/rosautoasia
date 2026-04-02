"use client";

import CountUp from "@/components/CountUp";
import BlurText from "@/components/BlurText";
import GradientText from "@/components/GradientText";
import RotatingText from "@/components/RotatingText";
import ShinyText from "@/components/ShinyText";
import ClickSpark from "@/components/ClickSpark";
import ScrollFloat from "@/components/ScrollFloat";

export function HeroTitle() {
  return (
    <GradientText
      colors={["#451A03", "#9d4300", "#f97316", "#ea580c", "#451A03"]}
      animationSpeed={6}
      className="font-[family-name:var(--font-headline)] text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
    >
      Автозапчасти из Японии, Кореи и Китая
    </GradientText>
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

export function FloatingHeading({ text, className = "" }: { text: string; className?: string }) {
  return (
    <ScrollFloat
      textClassName={className}
      animationDuration={1}
      ease="back.inOut(2)"
      scrollStart="center bottom+=50%"
      scrollEnd="bottom bottom-=40%"
      stagger={0.03}
    >
      {text}
    </ScrollFloat>
  );
}

export function ShinyBadge({ text, className = "", color = "#16a34a", shineColor = "#4ade80" }: { text: string; className?: string; color?: string; shineColor?: string }) {
  return (
    <ShinyText
      text={text}
      speed={3}
      color={color}
      shineColor={shineColor}
      className={className}
    />
  );
}
