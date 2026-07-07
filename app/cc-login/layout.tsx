import type { Metadata } from "next";
import "../command-center/command-center.css";

export const metadata: Metadata = {
  title: "Log in — Business Command Center",
  robots: { index: false, follow: false },
};

export default function CcLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="cc-body">{children}</body>
    </html>
  );
}
