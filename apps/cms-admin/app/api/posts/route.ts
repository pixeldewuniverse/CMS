import { getPostsBySite } from '@packages/api/controllers/posts.controller';
import { toResponse } from '@packages/api/routes/response';

export async function GET(request: Request) {
  const domain = new URL(request.url).searchParams.get('site');
  if (!domain) return Response.json({ message: 'Missing site query param' }, { status: 400 });

  const result = await getPostsBySite(domain);
  return toResponse(result);
}
