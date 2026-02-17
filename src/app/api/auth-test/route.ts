import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectToDB } from '@/lib/mongodb';
import Chef from '@/models/Chef';

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Testing authentication...');
    
    const session = await getServerSession(authOptions);
    console.log('Session from getServerSession:', session);
    
    if (!session?.user) {
      return NextResponse.json({
        authenticated: false,
        message: 'No session found',
        session: session
      });
    }
    
    await connectToDB();
    
    const chef = await Chef.findById(session.user.id);
    
    return NextResponse.json({
      authenticated: true,
      session: {
        user: session.user,
        expires: session.expires
      },
      chef: chef ? {
        id: chef._id,
        email: chef.email,
        businessName: chef.businessName,
        approved: chef.approved,
        profileCompleted: chef.profileCompleted
      } : null
    });
    
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      authenticated: false,
      error: String(error)
    }, { status: 500 });
  }
}