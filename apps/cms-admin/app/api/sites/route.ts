import { createSite, getSites } from '@packages/api/controllers/sites.controller';
import { toResponse } from '@packages/api/routes/response';

export async function GET() {
  const data = await getSites();
  return Response.json(data);
}

export async function POST(request: Request) {
  const result = await createSite(request);
  return toResponse(result, 201);
}
