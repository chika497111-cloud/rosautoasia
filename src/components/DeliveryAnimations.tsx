"use client";

import ShinyText from "@/components/ShinyText";

export function ShinyFree() {
  return (
    <span className="inline-block bg-green-100 px-3 py-1 rounded-full">
      <ShinyText
        text="Бесплатно"
        speed={3}
        color="#15803d"
        shineColor="#4ade80"
        className="font-bold"
      />
    </span>
  );
}
