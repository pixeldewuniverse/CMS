import { fetchPage } from '@/lib/cms';

export default async function ContactPage() {
  const page = await fetchPage('contact');
  return <article><h1 className="text-3xl font-bold">{page.title}</h1></article>;
}
