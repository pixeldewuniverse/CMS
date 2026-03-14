import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-5xl gap-4 p-4 text-sm">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}
