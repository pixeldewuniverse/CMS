import Link from 'next/link';
import { getPosts } from '@/lib/cms';

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <section>
      <h1 className="mb-4 text-3xl font-bold">Blog</h1>
      <ul className="space-y-2">
        {posts.map((post: any) => (
          <li key={post.id}>
            <Link href={`/blog/${post.slug}`} className="text-blue-600">{post.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
