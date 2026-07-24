"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface InviteCodeBadgeProps {
  code: string;
  studentName?: string;
  size?: "sm" | "md";
}

export default function InviteCodeBadge({ code, studentName, size = "md" }: InviteCodeBadgeProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `Код для входа в приложение «Тренировки»${
    studentName ? ` (${studentName})` : ""
  }: ${code}`;

  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCopy = async (e: React.SyntheticEvent) => {
    stop(e);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // буфер обмена недоступен - молча игнорируем
    }
  };

  const handleShare = async (e: React.SyntheticEvent) => {
    stop(e);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // пользователь отменил шаринг - ничего страшного
      }
    } else {
      handleCopy(e);
    }
  };

  const text = size === "sm" ? "text-xs" : "text-sm";
  const iconSize = size === "sm" ? 12 : 14;
  const iconBtn = size === "sm" ? "w-6 h-6" : "w-8 h-8";

  return (
    <span className="inline-flex items-center gap-1.5" onClick={stop}>
      <span className={`font-mono font-semibold tracking-wider ${text}`}>{code}</span>
      <button
        onClick={handleCopy}
        title="Скопировать код"
        className={`icon-badge ${iconBtn} bg-gray-100 hover:bg-gray-200 transition-colors`}
      >
        {copied ? <Check size={iconSize} className="text-[var(--accent)]" /> : <Copy size={iconSize} />}
      </button>
      <button
        onClick={handleShare}
        title="Отправить код"
        className={`icon-badge ${iconBtn} bg-gray-100 hover:bg-gray-200 transition-colors`}
      >
        <Share2 size={iconSize} />
      </button>
      {copied && <span className="text-emerald-500 text-xs font-medium">Скопировано!</span>}
    </span>
  );
}
