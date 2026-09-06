"use client";

import { FormEvent, useState } from "react";
import { SceneBackdrop } from "./SceneBackdrop";

export function NameForm({ onLaunch }: { onLaunch: (name: string) => void }) {
  const [name, setName] = useState("");
  const trimmed = name.trim();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (trimmed.length < 1 || trimmed.length > 20) return;
    onLaunch(trimmed);
  }

  return (
    <form
      onSubmit={submit}
      className="relative flex min-h-dvh flex-col justify-end overflow-hidden bg-[var(--bg-void)] px-6 pb-16 pt-12"
    >
      <SceneBackdrop />
      <div className="relative z-10 flex flex-col">
        <p className="font-serif text-sm italic text-[var(--text-muted)]">
          IE Aerospace Club — Segovia
        </p>
        <h1 className="font-display mt-2 text-5xl font-extrabold tracking-tight">
          Touchdown
        </h1>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          maxLength={20}
          placeholder="Your name"
          autoComplete="off"
          className="mt-12 border-b border-[var(--text-muted)] bg-transparent py-3 text-2xl outline-none placeholder:text-[var(--text-muted)]"
        />
        <button
          type="submit"
          disabled={trimmed.length < 1}
          className="font-display mt-8 bg-[var(--accent)] px-6 py-3 text-lg font-semibold text-[var(--bg-void)] disabled:opacity-40"
        >
          Launch
        </button>
      </div>
    </form>
  );
}
