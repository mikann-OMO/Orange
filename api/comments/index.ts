import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  connectToDatabase,
  formatComment,
  getClientInfo,
  generateFingerprint,
  sanitizeContent,
  validateEmail,
  validateUrl,
  handleOptions,
  corsHeaders,
  generateAvatar,
} from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  const { ip, userAgent } = getClientInfo(req);
  const userFingerprint = generateFingerprint(ip, userAgent);

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('comments');

    if (req.method === 'GET') {
      return await handleGetComments(req, res, collection, userFingerprint);
    }

    if (req.method === 'POST') {
      return await handlePostComment(req, res, collection, ip, userAgent);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetComments(
  req: VercelRequest,
  res: VercelResponse,
  collection: any,
  userFingerprint: string
) {
  const { postSlug, page = '1', pageSize = '20' } = req.query;

  if (!postSlug || typeof postSlug !== 'string') {
    return res.status(400).json({ error: 'postSlug is required' });
  }

  const pageNum = Number.parseInt(page as string, 10);
  const pageSizeNum = Math.min(Number.parseInt(pageSize as string, 10), 50);
  const skip = (pageNum - 1) * pageSizeNum;

  const [comments, total] = await Promise.all([
    collection
      .find({
        postSlug,
        parentId: null,
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSizeNum)
      .toArray(),
    collection.countDocuments({
      postSlug,
      isDeleted: false,
    }),
  ]);

  const commentsWithReplies = await Promise.all(
    comments.map(async (comment: any) => {
      const replies = await collection
        .find({
          postSlug,
          parentId: comment._id.toString(),
          isDeleted: false,
        })
        .sort({ createdAt: 1 })
        .toArray();

      return {
        ...formatComment(comment, userFingerprint),
        replies: replies.map((reply: any) => formatComment(reply, userFingerprint)),
      };
    })
  );

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  Object.entries(corsHeaders(req)).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  return res.status(200).json({
    comments: commentsWithReplies,
    pagination: {
      page: pageNum,
      pageSize: pageSizeNum,
      total,
      totalPages: Math.ceil(total / pageSizeNum),
    },
  });
}

async function handlePostComment(
  req: VercelRequest,
  res: VercelResponse,
  collection: any,
  ip: string,
  userAgent: string
) {
  const { postSlug, parentId, author, content } = req.body;

  if (!postSlug || !author?.name || !author?.email || !content) {
    return res.status(400).json({
      error: 'Missing required fields: postSlug, author.name, author.email, content',
    });
  }

  if (!validateEmail(author.email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (author.website && !validateUrl(author.website)) {
    return res.status(400).json({ error: 'Invalid website URL' });
  }

  if (content.length < 1 || content.length > 5000) {
    return res.status(400).json({ error: 'Content must be between 1 and 5000 characters' });
  }

  if (author.name.length > 50) {
    return res.status(400).json({ error: 'Name must be less than 50 characters' });
  }

  const sanitizedContent = sanitizeContent(content);
  const now = new Date();

  const comment = {
    postSlug,
    parentId: parentId || null,
    author: {
      name: author.name.trim(),
      email: author.email.trim().toLowerCase(),
      website: author.website?.trim() || undefined,
      avatar: generateAvatar(author.email),
    },
    content: sanitizedContent,
    likes: 0,
    likedBy: [],
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
    userAgent,
    ip,
  };

  const result = await collection.insertOne(comment);

  Object.entries(corsHeaders(req)).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  return res.status(201).json({
    success: true,
    comment: {
      id: result.insertedId.toString(),
      ...comment,
      _id: undefined,
      ip: undefined,
      userAgent: undefined,
    },
  });
}
