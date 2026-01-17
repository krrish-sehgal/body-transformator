'use server';

import { db } from '@/lib/db';
import { users, userProfiles } from '@/lib/db/schema';
import { hashPassword, verifyPassword } from '@/lib/utils/auth';
import { setUserId, getUserId, clearUserId } from '@/lib/utils/session';
import { eq } from 'drizzle-orm';

export async function createUser(username: string, password: string) {
  try {
    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
    
    if (existing.length > 0) {
      return { success: false, error: 'Username already exists' };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [newUser] = await db.insert(users).values({
      username,
      passwordHash,
    }).returning();

    // Store userId in cookie
    await setUserId(newUser.id);

    return { success: true, userId: newUser.id };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function loginUser(username: string, password: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Store userId in cookie
    await setUserId(user.id);

    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, error: 'Failed to login' };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    return profile || null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function getCurrentUserId() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { success: false, error: 'Not logged in' };
    }

    // Verify user exists in database (in case of fresh database start)
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      // User doesn't exist - clear the invalid cookie
      await clearUserId();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    return { success: true, userId };
  } catch (error) {
    console.error('Error getting userId:', error);
    return { success: false, error: 'Failed to get userId' };
  }
}

export async function createUserProfile(
  userId: string,
  data: {
    weightKg: number;
    heightCm: number;
    age: number;
    bodyFatPercent: number;
    gender: 'male' | 'female';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
    targetCalories: number;
    targetProtein: number;
    targetFats: number;
    targetCarbs: number;
  }
) {
  try {
    await db.insert(userProfiles).values({
      userId,
      ...data,
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: 'Failed to create profile' };
  }
}

export async function updateUserProfile(
  userId: string,
  data: {
    weightKg: number;
    heightCm: number;
    age: number;
    bodyFatPercent: number;
    gender: 'male' | 'female';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
    targetCalories: number;
    targetProtein: number;
    targetFats: number;
    targetCarbs: number;
  }
) {
  try {
    await db
      .update(userProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));

    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

