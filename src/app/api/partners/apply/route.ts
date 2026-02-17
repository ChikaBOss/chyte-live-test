// app/api/partners/apply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Chef from '@/models/Chef';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const required = ['businessName', 'ownerName', 'email', 'phone', 'address', 'category', 'password'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    await connectToDB();

    // Check if email already exists
    const existingChef = await Chef.findOne({ 
      $or: [
        { email: body.email },
        { businessName: body.businessName }
      ]
    });

    if (existingChef) {
      return NextResponse.json(
        { error: 'Email or business name already exists' },
        { status: 400 }
      );
    }

    // Create and save chef application using Mongoose model
    const chefApplication = new Chef({
      ...body,
      approved: false,
      status: 'pending',
    });

    await chefApplication.save();

    console.log('Chef application saved to MongoDB:', chefApplication._id);

    return NextResponse.json(
      { 
        message: 'Application submitted successfully',
        id: chefApplication._id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}