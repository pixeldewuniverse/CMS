import Link from 'next/link';

const links = [
  ['Dashboard', '/dashboard'],
  ['Sites', '/sites'],
  ['Pages', '/pages'],
  ['Posts', '/posts'],
  ['Media', '/media'],
  ['Menus', '/menus'],
  ['Users', '/users'],
  ['Settings', '/settings']
];

export function Sidebar() {
  return (
    <aside className="min-h-screen w-64 bg-slate-900 p-4 text-white">
      <h1 className="mb-4 text-xl font-bold">CMS Admin</h1>
      <nav className="space-y-1">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="block rounded px-3 py-2 hover:bg-slate-700">
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
