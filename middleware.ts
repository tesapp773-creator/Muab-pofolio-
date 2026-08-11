import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Runs on everything except static assets, image optimization files, and
// common static file extensions. Using a character class for the dot
// avoids any ambiguity around escaping a literal '.' in this pattern string.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*[.](?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
