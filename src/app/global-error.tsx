"use client";

import PageError from "@/components/PageError";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <html lang="en">
      <body className="bg-[#1a1a1a] text-white antialiased" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <PageError reset={reset} />
      </body>
    </html>
  );
}
