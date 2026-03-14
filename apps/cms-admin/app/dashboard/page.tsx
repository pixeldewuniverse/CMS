export default function DashboardPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Websites</p>
          <p className="text-2xl font-bold">--</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Published Pages</p>
          <p className="text-2xl font-bold">--</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Published Posts</p>
          <p className="text-2xl font-bold">--</p>
        </div>
      </div>
    </section>
  );
}
