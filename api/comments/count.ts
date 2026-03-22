import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase, handleOptions, corsHeaders } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { postSlug } = req.query;

  if (!postSlug || typeof postSlug !== 'string') {
    return res.status(400).json({ error: 'postSlug is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('comments');

    const count = await collection.countDocuments({
      postSlug,
      isDeleted: false,
    });

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    Object.entries(corsHeaders(req)).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(200).json({
      postSlug,
      count,
    });
  } catch (error) {
    console.error('Count error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
