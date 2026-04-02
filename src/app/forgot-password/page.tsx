"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/login"); }, [router]);
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-on-surface-variant">Перенаправление...</div>
    </div>
  );
}
