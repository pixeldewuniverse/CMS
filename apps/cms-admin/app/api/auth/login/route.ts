import { login } from '@packages/api/controllers/auth.controller';
import { toResponse } from '@packages/api/routes/response';

export async function POST(request: Request) {
  const result = await login(request);
  return toResponse(result);
}
