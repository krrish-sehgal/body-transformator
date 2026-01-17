'use server';

import { cookies } from 'next/headers';

const USER_ID_COOKIE = 'user_id';

/**
 * Store userId in cookie after login/signup
 */
export async function setUserId(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(USER_ID_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

/**
 * Get userId from cookie
 */
export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(USER_ID_COOKIE);
  return userId?.value || null;
}

/**
 * Clear userId cookie (logout)
 */
export async function clearUserId() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_ID_COOKIE);
}

