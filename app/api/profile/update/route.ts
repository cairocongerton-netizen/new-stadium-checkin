/**
 * API Route: Update User Profile
 * POST /api/profile/update
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile } from '@/lib/sheets/operations';
import type { Discipline } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, workplace, disciplines, pin } = body;

    // Validation
    if (!userId || !name || !workplace || !disciplines || disciplines.length === 0 || !pin) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // Update profile
    const result = await updateUserProfile({
      userId,
      name,
      workplace,
      disciplines: disciplines as Discipline[],
      pin,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Update failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in profile update API:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
