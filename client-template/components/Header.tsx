import Link from 'next/link';
import { fetchMenu } from '@/lib/cms';

export async function Header() {
  const menu = await fetchMenu('main');

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-5xl gap-4 p-4">
        {(menu.items || []).map((item: any) => (
          <Link key={item.id} href={item.path} className="text-sm font-medium text-slate-700">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
