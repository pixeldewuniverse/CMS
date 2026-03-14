import '../styles/globals.css';
import { Header } from '@/components/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
