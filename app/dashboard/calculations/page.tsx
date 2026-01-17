import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/actions/foods';
import { getCurrentUserId } from '@/lib/actions/auth';
import CalculationsPageClient from './CalculationsPageClient';

export default async function CalculationsPage() {
  const result = await getCurrentUserId();
  
  if (!result.success || !result.userId) {
    redirect('/login');
  }
  
  const userId = result.userId;

  const profile = await getUserProfile(userId);
  
  if (!profile) {
    redirect('/setup');
  }

  return <CalculationsPageClient profile={profile} />;
}

