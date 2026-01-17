import { NextResponse } from 'next/server';
import { seedFoods } from '@/lib/db/seed';

export async function GET() {
  try {
    await seedFoods();
    return NextResponse.json({ success: true, message: 'Foods seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

