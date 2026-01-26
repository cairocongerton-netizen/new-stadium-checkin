/**
 * API Route: Lookup User by PIN
 * POST /api/lookup-by-pin
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserByPin } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin || pin.length !== 4) {
      return NextResponse.json(
        { error: 'Invalid PIN format' },
        { status: 400 }
      );
    }

    // Look up user by PIN
    const user = await getUserByPin(pin);

    if (user) {
      return NextResponse.json({
        exists: true,
        user: {
          name: user.name,
          email: user.email,
          disciplines: user.disciplines,
        },
      });
    } else {
      return NextResponse.json({
        exists: false,
      });
    }
  } catch (error) {
    console.error('Error in lookup-by-pin API:', error);
    return NextResponse.json(
      { error: 'Failed to lookup PIN' },
      { status: 500 }
    );
  }
}
