import { getPage } from '@/lib/cms';

export default async function HomePage() {
  const page = await getPage('home');
  return <h1 className="text-3xl font-bold">{page.title}</h1>;
}
