"use client";

import ClickSpark from "@/components/ClickSpark";

export function ClickSparkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClickSpark sparkColor="#f97316" sparkSize={10} sparkCount={8} sparkRadius={15} duration={400}>
      {children}
    </ClickSpark>
  );
}
