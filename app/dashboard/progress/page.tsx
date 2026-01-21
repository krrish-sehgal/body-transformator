import { getUserProfile, getAllDailyLogs } from '@/lib/actions/foods';
import { getCurrentUserId } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import ProgressClient from './ProgressClient';

export default async function ProgressPage() {
  const result = await getCurrentUserId();
  
  if (!result.success || !result.userId) {
    redirect('/login');
  }
  
  const userId = result.userId;

  const profile = await getUserProfile(userId);
  
  if (!profile) {
    redirect('/setup');
  }

  const allDailyLogs = await getAllDailyLogs(userId);

  return (
    <ProgressClient 
      profile={profile}
      allDailyLogs={allDailyLogs}
    />
  );
}
