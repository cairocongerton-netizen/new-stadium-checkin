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
    const { userId, name, preferred_name, workplace, disciplines } = body;

    // Validation
    if (!userId || !name || !workplace || !disciplines || disciplines.length === 0) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Update profile
    const result = await updateUserProfile({
      userId,
      name,
      preferred_name: preferred_name || '',
      workplace,
      disciplines: disciplines as Discipline[],
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
