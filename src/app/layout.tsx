import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import AppShell from "@/components/AppShell/AppShell";

export const metadata: Metadata = {
  title: "Swala Tracker — جدول السير والسلوك",
  description: "Digital Salah & student performance tracker for Islamic education. Track daily prayers, attendance, behaviour, and homework.",
  keywords: ["salah tracker", "prayer tracker", "islamic education", "student tracker"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <AppShell>
            {children}
          </AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
