export default function LoginPage() {
  return (
    <div className="mx-auto mt-20 max-w-md rounded bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Login</h2>
      <input placeholder="Email" className="mb-3 w-full rounded border p-2" />
      <input placeholder="Password" type="password" className="mb-4 w-full rounded border p-2" />
      <button className="w-full rounded bg-blue-600 py-2 text-white">Sign in</button>
    </div>
  );
}
