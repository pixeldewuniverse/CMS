import { getPageBySlug } from '@packages/api/controllers/pages.controller';
import { toResponse } from '@packages/api/routes/response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const domain = new URL(request.url).searchParams.get('site');
  if (!domain) return Response.json({ message: 'Missing site query param' }, { status: 400 });

  const result = await getPageBySlug(domain, slug);
  return toResponse(result);
}
