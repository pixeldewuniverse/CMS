export type PublishStatus = 'DRAFT' | 'PUBLISHED';

export interface SeoFields {
  seoTitle?: string;
  seoDescription?: string;
}

export interface SiteConfig extends SeoFields {
  id: string;
  name: string;
  domain: string;
  primaryColor?: string;
  logoUrl?: string;
}

export interface Page extends SeoFields {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  content: unknown;
  status: PublishStatus;
}

export interface Post extends SeoFields {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  content: unknown;
  status: PublishStatus;
  categoryId?: string;
}
