"use client";

import AnimatedContent from "@/components/AnimatedContent";

export function AnimatedCard({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <AnimatedContent
      distance={50}
      direction="vertical"
      duration={0.6}
      ease="power2.out"
      delay={index * 0.08}
      threshold={0.1}
      initialOpacity={0}
      animateOpacity
    >
      {children}
    </AnimatedContent>
  );
}
