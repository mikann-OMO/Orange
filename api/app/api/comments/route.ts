import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Comment, formatComment, generateFingerprint, getClientInfo, sanitizeContent, validateEmail, validateUrl } from '@/lib/db';
import { ObjectId } from 'mongodb';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/comments?postSlug=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postSlug = searchParams.get('postSlug');

    if (!postSlug) {
      return NextResponse.json(
        { error: 'postSlug is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection<Comment>('comments');

    const comments = await collection
      .find({ postSlug, isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();

    const commentMap = new Map<string, any>();
    const topLevelComments: any[] = [];

    comments.forEach((comment) => {
      const formatted = formatComment(comment);
      formatted.replies = [];
      commentMap.set(formatted.id, formatted);
    });

    comments.forEach((comment) => {
      const formatted = commentMap.get(comment._id!.toString())!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.replies!.push(formatted);
      } else {
        topLevelComments.push(formatted);
      }
    });

    return NextResponse.json(
      { comments: topLevelComments },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST /api/comments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postSlug, parentId, author, content, website } = body;

    // Validation
    if (!postSlug || !author?.name || !author?.email || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!validateEmail(author.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (website && !validateUrl(website)) {
      return NextResponse.json(
        { error: 'Invalid website URL' },
        { status: 400, headers: corsHeaders }
      );
    }

    const sanitizedContent = sanitizeContent(content);
    if (sanitizedContent.length < 2 || sanitizedContent.length > 5000) {
      return NextResponse.json(
        { error: 'Content must be between 2 and 5000 characters' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { ip, userAgent } = getClientInfo(request);

    const { db } = await connectToDatabase();
    const collection = db.collection<Comment>('comments');

    // Rate limiting
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentComments = await collection.countDocuments({
      'author.email': author.email,
      createdAt: { $gte: oneHourAgo },
    });

    if (recentComments >= 10) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: corsHeaders }
      );
    }

    // Check for duplicate
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const duplicate = await collection.findOne({
      postSlug,
      'author.email': author.email,
      content: sanitizedContent,
      createdAt: { $gte: fiveMinutesAgo },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: 'Duplicate comment detected' },
        { status: 409, headers: corsHeaders }
      );
    }

    const newComment: Omit<Comment, '_id'> = {
      postSlug,
      parentId: parentId || null,
      author: {
        name: author.name.trim(),
        email: author.email.trim().toLowerCase(),
        website: website?.trim(),
      },
      content: sanitizedContent,
      likes: 0,
      likedBy: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      ip,
      userAgent,
    };

    const result = await collection.insertOne(newComment as Comment);
    const comment = { ...newComment, _id: result.insertedId };

    return NextResponse.json(
      { comment: formatComment(comment) },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Post comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
