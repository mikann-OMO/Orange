import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

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
    const collection = db.collection('comments');

    const count = await collection.countDocuments({
      postSlug,
      isDeleted: false,
    });

    return NextResponse.json(
      { postSlug, count },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Count error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
