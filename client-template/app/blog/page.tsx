import Link from 'next/link';
import { fetchPosts } from '@/lib/cms';

export default async function BlogPage() {
  const posts = await fetchPosts();
  return (
    <section>
      <h1 className="mb-4 text-3xl font-bold">Blog</h1>
      <ul className="space-y-2">
        {posts.map((post: any) => (
          <li key={post.id}><Link className="text-blue-600" href={`/blog/${post.slug}`}>{post.title}</Link></li>
        ))}
      </ul>
    </section>
  );
}
