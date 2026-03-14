import { fetchPost } from '@/lib/cms';

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug);
  return <article><h1 className="text-3xl font-bold">{post.title}</h1></article>;
}
