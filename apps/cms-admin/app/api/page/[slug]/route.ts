import { getPageBySlug } from '@packages/api/controllers/pages.controller';
import { toResponse } from '@packages/api/routes/response';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const domain = new URL(request.url).searchParams.get('site');
  if (!domain) return Response.json({ message: 'Missing site query param' }, { status: 400 });

  const result = await getPageBySlug(domain, params.slug);
  return toResponse(result);
}
