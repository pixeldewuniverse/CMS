import { getPage } from '@/lib/cms';

export default async function AboutPage() {
  const page = await getPage('about');
  return <h1 className="text-3xl font-bold">{page.title}</h1>;
}
