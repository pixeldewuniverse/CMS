import { fetchPage } from '@/lib/cms';

export default async function AboutPage() {
  const page = await fetchPage('about');
  return <article><h1 className="text-3xl font-bold">{page.title}</h1></article>;
}
