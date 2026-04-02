"use client";

import CountUp from "@/components/CountUp";

const stats = [
  { value: 8, suffix: "+", label: "лет", sublabel: "непрерывной работы на рынке КР" },
  { value: 100000, suffix: "+", label: "", sublabel: "запчастей в постоянном наличии" },
  { value: 50, suffix: "+", label: "", sublabel: "прямых контрактов с брендами" },
  { value: 10000, suffix: "+", label: "", sublabel: "довольных постоянных клиентов" },
];

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 scroll-reveal">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="cta-gradient p-8 rounded-xl text-white warm-shadow group hover:scale-[1.02] transition-transform"
        >
          <p className="text-4xl font-extrabold font-[family-name:var(--font-headline)] mb-2">
            <CountUp to={stat.value} duration={2.5} separator=" " />
            {stat.suffix} {stat.label}
          </p>
          <p className="text-white/90 font-medium">{stat.sublabel}</p>
        </div>
      ))}
    </div>
  );
}
