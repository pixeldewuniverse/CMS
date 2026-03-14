import Link from 'next/link';

const navItems = [
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
    <aside className="w-60 min-h-screen bg-slate-900 text-white p-5">
      <h1 className="text-xl font-bold mb-6">CMS Admin</h1>
      <nav className="space-y-2">
        {navItems.map(([label, href]) => (
          <Link key={href} href={href} className="block rounded px-3 py-2 hover:bg-slate-700">
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
