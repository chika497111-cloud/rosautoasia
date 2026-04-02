"use client";

import SplitText from "@/components/SplitText";

export function AnimatedH1({ text, className = "" }: { text: string; className?: string }) {
  return (
    <SplitText
      text={text}
      className={className}
      delay={30}
      duration={0.8}
      ease="power3.out"
      splitType="chars"
      from={{ opacity: 0, y: 40 }}
      to={{ opacity: 1, y: 0 }}
      threshold={0.1}
      tag="h1"
    />
  );
}

export function AnimatedH2({ text, className = "" }: { text: string; className?: string }) {
  return (
    <SplitText
      text={text}
      className={className}
      delay={20}
      duration={0.6}
      ease="power2.out"
      splitType="words"
      from={{ opacity: 0, y: 20 }}
      to={{ opacity: 1, y: 0 }}
      threshold={0.1}
      tag="h2"
    />
  );
}
