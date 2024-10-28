import connectMongo from '@/lib/connectMongo';
import Report from '@/models/Report';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectMongo();
  const reportCount = await Report.countDocuments();
  return NextResponse.json({ count: reportCount });
}
