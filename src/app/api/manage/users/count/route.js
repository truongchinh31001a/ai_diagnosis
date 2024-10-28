import connectMongo from '@/lib/connectMongo';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectMongo();
  const userCount = await User.countDocuments();
  return NextResponse.json({ count: userCount });
}
