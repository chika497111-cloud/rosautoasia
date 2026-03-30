"use client";

import { useState } from "react";

export function ArticleCopy({ article }: { article: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(article);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = article;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <p className="text-on-surface-variant mb-4">
      Артикул:{" "}
      <button
        type="button"
        onClick={handleCopy}
        className="relative inline-flex items-center gap-1.5 font-mono text-secondary cursor-pointer hover:text-primary transition-colors group"
        title="Скопировать артикул"
      >
        {article}
        <span className="material-symbols-outlined text-base opacity-50 group-hover:opacity-100 transition-opacity">
          content_copy
        </span>
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#451A03] text-white text-xs px-3 py-1 rounded-full whitespace-nowrap shadow-lg animate-[fadeIn_0.2s_ease-in-out]">
            Скопировано!
          </span>
        )}
      </button>
    </p>
  );
}
