import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, generateFingerprint, getClientInfo } from '@/lib/db';
import { ObjectId } from 'mongodb';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: 'commentId is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { ip, userAgent } = getClientInfo(request);
    const userFingerprint = generateFingerprint(ip, userAgent);

    const { db } = await connectToDatabase();
    const collection = db.collection('comments');

    const comment = await collection.findOne({
      _id: new ObjectId(commentId),
      isDeleted: false,
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const hasLiked = comment.likedBy?.includes(userFingerprint);

    if (hasLiked) {
      await collection.updateOne(
        { _id: new ObjectId(commentId) },
        {
          $pull: { likedBy: userFingerprint },
          $inc: { likes: -1 },
        }
      );
    } else {
      await collection.updateOne(
        { _id: new ObjectId(commentId) },
        {
          $addToSet: { likedBy: userFingerprint },
          $inc: { likes: 1 },
        }
      );
    }

    return NextResponse.json(
      { liked: !hasLiked },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
