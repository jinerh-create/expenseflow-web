import type { APIRoute } from 'astro';
import { getDB, getStats } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  const db = getDB(locals);
  const stats = await getStats(db);
  return new Response(JSON.stringify(stats), { headers: { 'Content-Type': 'application/json' } });
};
