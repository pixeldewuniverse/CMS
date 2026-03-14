import { getPage } from '@/lib/cms';

export default async function ContactPage() {
  const page = await getPage('contact');
  return <h1 className="text-3xl font-bold">{page.title}</h1>;
}
