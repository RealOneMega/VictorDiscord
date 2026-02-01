import './globals.css';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Victor Discord Dashboard',
  description: 'Configure and monetize your Discord experience.',
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <Link href="/">Overview</Link>
          <Link href="/dashboard">Configuration</Link>
          <Link href="/analytics">Analytics</Link>
          <Link href="/billing">Billing</Link>
          <Link href="/owner">Owner Console</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
};

export default RootLayout;
