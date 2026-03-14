const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000';
const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'mydomain.com';

export async function getPage(slug: string) {
  const response = await fetch(`${CMS_URL}/api/page/${slug}?site=${SITE_DOMAIN}`, { next: { revalidate: 60 } });
  if (!response.ok) throw new Error('Unable to fetch page');
  return response.json();
}

export async function getPosts() {
  const response = await fetch(`${CMS_URL}/api/posts?site=${SITE_DOMAIN}`, { next: { revalidate: 60 } });
  if (!response.ok) throw new Error('Unable to fetch posts');
  return response.json();
}

export async function getPost(slug: string) {
  const response = await fetch(`${CMS_URL}/api/post/${slug}?site=${SITE_DOMAIN}`, { next: { revalidate: 60 } });
  if (!response.ok) throw new Error('Unable to fetch post');
  return response.json();
}
