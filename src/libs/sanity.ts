import { createClient } from 'next-sanity';
import type { SanityClient } from 'sanity';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_STUDIO_TOKEN,
  apiVersion: '2025-04-30',
}) as SanityClient;

export default sanityClient;
