"use client";

import { QRCodeSVG } from "qrcode.react";

export function QRCodeBlock({ url, label }: { url: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="font-display text-sm font-semibold tracking-[0.2em] text-[var(--accent)]">
        {label}
      </p>
      <div className="bg-[var(--ie-white)] p-3">
        <QRCodeSVG value={url} size={168} level="M" includeMargin={false} />
      </div>
    </div>
  );
}
