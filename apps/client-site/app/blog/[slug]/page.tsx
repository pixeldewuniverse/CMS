import { getPost } from '@/lib/cms';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  return <h1 className="text-3xl font-bold">{post.title}</h1>;
}
