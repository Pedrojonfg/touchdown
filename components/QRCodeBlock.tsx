"use client";

import { QRCodeSVG } from "qrcode.react";

export function QRCodeBlock({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-[var(--ie-white)] p-4">
        <QRCodeSVG value={url} size={220} level="M" includeMargin={false} />
      </div>
      <p className="font-serif text-xl italic text-[var(--text-muted)]">
        Scan to play
      </p>
    </div>
  );
}
