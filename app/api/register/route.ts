/**
 * API Route: Register User
 * POST /api/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/sheets/operations';
import type { Discipline } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, preferred_name, workplace, pin, disciplines } = body;

    // Validation
    if (!email || !name || !workplace || !pin || !disciplines || disciplines.length === 0) {
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

    // Register user
    const result = await registerUser({
      email,
      name,
      preferred_name: preferred_name || '',
      workplace,
      pin,
      disciplines: disciplines as Discipline[],
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Registration failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, userId: result.userId });
  } catch (error) {
    console.error('Error in register API:', error);
    return NextResponse.json(
      { error: 'Failed to register' },
      { status: 500 }
    );
  }
}
