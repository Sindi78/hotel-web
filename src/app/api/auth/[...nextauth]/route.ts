import NextAuth from 'next-auth';

import { authOptions } from '@/libs/auth';

async function handler(req: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  const params = await context.params;
  return NextAuth({
    ...authOptions,
    callbacks: {
      ...authOptions.callbacks,
    },
  })(req, { params: { nextauth: params.nextauth } });
}

export { handler as GET, handler as POST };