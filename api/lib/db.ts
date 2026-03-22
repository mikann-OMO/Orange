import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest } from 'next/server';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'blog_comments';

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in your environment variables');
}

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI!);
  await client.connect();
  
  const db = client.db(MONGODB_DB);
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

export interface Comment {
  _id?: ObjectId;
  postSlug: string;
  parentId: string | null;
  author: {
    name: string;
    email: string;
    website?: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  likedBy: string[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  userAgent?: string;
  ip?: string;
}

export interface CommentResponse {
  id: string;
  postSlug: string;
  parentId: string | null;
  author: {
    name: string;
    avatar: string;
    website?: string;
  };
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: CommentResponse[];
}

export function formatComment(comment: Comment, userFingerprint?: string): CommentResponse {
  return {
    id: comment._id!.toString(),
    postSlug: comment.postSlug,
    parentId: comment.parentId,
    author: {
      name: comment.author.name,
      avatar: comment.author.avatar || generateAvatar(comment.author.email),
      website: comment.author.website,
    },
    content: comment.content,
    likes: comment.likes,
    isLiked: userFingerprint ? comment.likedBy.includes(userFingerprint) : false,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}

export function generateAvatar(email: string): string {
  const hash = email.trim().toLowerCase();
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(hash)}`;
}

export function generateFingerprint(ip: string, userAgent: string): string {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(`${ip}-${userAgent}`)
    .digest('hex')
    .substring(0, 16);
}

export function getClientInfo(req: NextRequest): { ip: string; userAgent: string } {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             req.headers.get('x-real-ip') ||
             'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return { ip, userAgent };
}

export function sanitizeContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string | undefined): boolean {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
