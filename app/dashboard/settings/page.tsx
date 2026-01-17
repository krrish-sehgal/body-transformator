import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/actions/foods';
import { getCurrentUserId } from '@/lib/actions/auth';
import SettingsPageClient from './SettingsPageClient';

export default async function SettingsPage() {
  const result = await getCurrentUserId();
  
  if (!result.success || !result.userId) {
    redirect('/login');
  }
  
  const userId = result.userId;

  const profile = await getUserProfile(userId);
  
  if (!profile) {
    redirect('/setup');
  }

  // Convert cm to feet/inches
  const totalInches = profile.heightCm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);

  // Map activity level back to gym days
  const activityToGymDays: Record<string, string> = {
    'sedentary': '0',
    'light': '2',
    'moderate': '3',
    'active': '5',
  };
  const gymDays = activityToGymDays[profile.activityLevel] || '3';

  return (
    <SettingsPageClient 
      profile={profile} 
      userId={userId}
      initialHeightFeet={feet.toString()}
      initialHeightInches={inches.toString()}
      initialGymDays={gymDays}
    />
  );
}

