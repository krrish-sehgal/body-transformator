import { redirect } from 'next/navigation';
import { getUserProfile, getDailyLog, getAllFoods, getAllDailyLogs } from '@/lib/actions/foods';
import { getCurrentUserId } from '@/lib/actions/auth';
import DashboardClient from './DashboardClient';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const result = await getCurrentUserId();
  
  if (!result.success || !result.userId) {
    redirect('/login');
  }
  
  const userId = result.userId;

  const profile = await getUserProfile(userId);
  
  if (!profile) {
    redirect('/setup');
  }

  // Get the date from query params or use today
  const params = await searchParams;
  let date = params.date;
  // Normalize date format to ensure YYYY-MM-DD
  if (date) {
    if (date.includes('T')) {
      date = date.split('T')[0];
    }
    if (date.length > 10) {
      date = date.substring(0, 10);
    }
  }
  
  // Debug logging
  console.log(`[DashboardPage] Requested date: ${date || 'undefined (will use today)'}`);
  
  const dailyLog = await getDailyLog(userId, date);
  
  // Debug logging
  if (dailyLog) {
    console.log(`[DashboardPage] Found dailyLog for date: ${dailyLog.date}`);
  } else {
    console.log(`[DashboardPage] No dailyLog found for requested date`);
  }
  const foods = await getAllFoods(userId);
  const allDailyLogs = await getAllDailyLogs(userId);

  return (
    <DashboardClient 
      profile={profile} 
      dailyLog={dailyLog} 
      foods={foods}
      userId={userId}
      allDailyLogs={allDailyLogs}
      currentDate={date || undefined}
    />
  );
}

