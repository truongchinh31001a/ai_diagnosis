import connectMongo from '@/lib/connectMongo'; 
import Report from '@/models/Report'; 

export async function GET() {
  try {
    await connectMongo();

    const reports = await Report.find(); 

    return new Response(JSON.stringify({ reports }), { status: 200 });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return new Response(JSON.stringify({ message: 'Failed to fetch reports', error }), { status: 500 });
  }
}
