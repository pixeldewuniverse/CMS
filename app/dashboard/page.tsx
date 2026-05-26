// app/dashboard/page.tsx
import Link from 'next/link';
import BriefsList from '@/components/dashboard/BriefsList';

export const metadata = {
  title: 'Dashboard - Content Calendar',
};

export default function DashboardPage() {
  // TODO: Get userId from auth context
  const userId = 'user-placeholder';

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage your content calendar briefs</p>
          </div>
          <Link href="/briefs/new" className="btn-primary">
            ➕ New Brief
          </Link>
        </div>

        {/* Briefs List */}
        <BriefsList userId={userId} />
      </div>
    </main>
  );
}
