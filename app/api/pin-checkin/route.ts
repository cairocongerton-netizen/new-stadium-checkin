/**
 * API Route: Check In with PIN
 * POST /api/pin-checkin
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkInUserByPin } from '@/lib/database';
import type { Discipline } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin, name, email, disciplines, reason } = body;

    // Validation
    if (!pin || pin.length !== 4) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 400 }
      );
    }

    if (!name || !email || !disciplines || disciplines.length === 0 || !reason) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (reason.length < 10 || reason.length > 500) {
      return NextResponse.json(
        { error: 'Reason must be between 10 and 500 characters' },
        { status: 400 }
      );
    }

    // Perform check-in
    const result = await checkInUserByPin({
      pin,
      name,
      email,
      disciplines: disciplines as Discipline[],
      reason,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Check-in failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in pin-checkin API:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    );
  }
}
