import './globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import Header from './header';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GESTION MAINTENANCE',
  description: '',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
