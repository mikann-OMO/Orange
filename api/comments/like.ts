import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  connectToDatabase,
  getClientInfo,
  generateFingerprint,
  handleOptions,
  corsHeaders,
} from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ip, userAgent } = getClientInfo(req);
  const userFingerprint = generateFingerprint(ip, userAgent);

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('comments');

    const { commentId } = req.body;

    if (!commentId) {
      return res.status(400).json({ error: 'commentId is required' });
    }

    const comment = await collection.findOne({
      _id: require('mongodb').ObjectId.createFromHexString(commentId),
      isDeleted: false,
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const hasLiked = comment.likedBy.includes(userFingerprint);

    if (hasLiked) {
      await collection.updateOne(
        { _id: comment._id },
        {
          $inc: { likes: -1 },
          $pull: { likedBy: userFingerprint },
        }
      );
    } else {
      await collection.updateOne(
        { _id: comment._id },
        {
          $inc: { likes: 1 },
          $addToSet: { likedBy: userFingerprint },
        }
      );
    }

    const updatedComment = await collection.findOne({ _id: comment._id });

    Object.entries(corsHeaders(req)).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(200).json({
      success: true,
      likes: updatedComment!.likes,
      isLiked: !hasLiked,
    });
  } catch (error) {
    console.error('Like error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
