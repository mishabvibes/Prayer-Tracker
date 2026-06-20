import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import Sidebar from "@/components/Sidebar/Sidebar";

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
          <Sidebar />
          <main style={{
            marginLeft: 'var(--sidebar-width)',
            minHeight: '100vh',
            padding: '32px',
            transition: 'margin-left 250ms cubic-bezier(0.2, 0, 0, 1)',
          }}>
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
