import { register } from '@packages/api/controllers/auth.controller';
import { toResponse } from '@packages/api/routes/response';

export async function POST(request: Request) {
  const result = await register(request);
  return toResponse(result, 201);
}
