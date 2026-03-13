const CMS_API = process.env.CMS_API_URL || 'http://localhost:4000';
const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'example.com';

export async function fetchPages() {
  const res = await fetch(`${CMS_API}/pages?site=${SITE_DOMAIN}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch pages');
  return res.json();
}

export async function fetchPage(slug: string) {
  const res = await fetch(`${CMS_API}/page/${slug}?site=${SITE_DOMAIN}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch page');
  return res.json();
}

export async function fetchPosts() {
  const res = await fetch(`${CMS_API}/posts?site=${SITE_DOMAIN}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function fetchPost(slug: string) {
  const res = await fetch(`${CMS_API}/post/${slug}?site=${SITE_DOMAIN}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

export async function fetchMenu(location = 'main') {
  const res = await fetch(`${CMS_API}/menu?site=${SITE_DOMAIN}&location=${location}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch menu');
  return res.json();
}
