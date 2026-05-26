import Link from 'next/link';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Content Calendar Automation</h1>
      <p className="text-lg text-slate-600 mb-8">
        Auto-generate content calendar dengan AI. Step 1, 2 & 3 done ✅
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-2">Database</h2>
          <p className="text-sm text-slate-600">MongoDB collections ready</p>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-2">AI Ideas Generator</h2>
          <p className="text-sm text-slate-600">Claude Opus integration</p>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-2">Review & Curation</h2>
          <p className="text-sm text-slate-600">Approve/reject ideas UI</p>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <Link href="/dashboard" className="btn-primary">
          📊 Go to Dashboard
        </Link>
        <Link href="/briefs/new" className="btn-secondary">
          ➕ New Brief
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Progress</h2>
        <div className="space-y-2 text-slate-700">
          <p>✅ Step 1: Database & structure</p>
          <p>✅ Step 2: Brief input form + API</p>
          <p>✅ Step 3: AI ideas generation + review</p>
          <p>⏭️  Step 4: Caption + hashtag generation</p>
          <p>⏭️  Step 5: Visual brief generation</p>
          <p>⏭️  Step 6: Design execution (manual)</p>
          <p>⏭️  Step 7: Calendar management</p>
          <p>⏭️  Step 8: Buffer/Later integration</p>
          <p>⏭️  Step 9: Analytics dashboard</p>
        </div>
      </div>
    </main>
  );
}
