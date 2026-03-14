import { fetchPage } from '@/lib/cms';

export default async function HomePage() {
  const page = await fetchPage('home');
  return <article><h1 className="text-3xl font-bold">{page.title}</h1></article>;
}
