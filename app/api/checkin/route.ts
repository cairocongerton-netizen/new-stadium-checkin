/**
 * API Route: Check In
 * POST /api/checkin
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkInUser } from '@/lib/sheets/operations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, reason } = body;

    // Validation
    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'User ID and reason are required' },
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
    const result = await checkInUser({
      userId,
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
    console.error('Error in checkin API:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    );
  }
}
