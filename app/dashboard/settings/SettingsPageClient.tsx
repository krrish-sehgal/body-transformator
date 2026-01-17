'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserProfile } from '@/lib/actions/auth';
import { calculateRecompTargets } from '@/lib/calculations/recomp';
import NavigationSidebar from '@/components/dashboard/NavigationSidebar';

interface SettingsPageClientProps {
  profile: any;
  userId: string;
  initialHeightFeet: string;
  initialHeightInches: string;
  initialGymDays: string;
}

export default function SettingsPageClient({ 
  profile, 
  userId,
  initialHeightFeet,
  initialHeightInches,
  initialGymDays
}: SettingsPageClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    weightKg: profile.weightKg.toString(),
    heightFeet: initialHeightFeet,
    heightInches: initialHeightInches,
    age: profile.age.toString(),
    bodyFatPercent: profile.bodyFatPercent.toString(),
    gender: profile.gender as 'male' | 'female',
    gymDays: initialGymDays as '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Convert feet and inches to cm
      const feet = parseFloat(formData.heightFeet || '0');
      const inches = parseFloat(formData.heightInches || '0');
      const totalInches = (feet * 12) + inches;
      const heightCm = totalInches * 2.54;
      
      // Map gym days to activity level
      const gymDaysMap: Record<string, 'sedentary' | 'light' | 'moderate' | 'active'> = {
        '0': 'sedentary',
        '1': 'sedentary',
        '2': 'light',
        '3': 'moderate',
        '4': 'moderate',
        '5': 'active',
        '6': 'active',
        '7': 'active',
      };
      const activityLevel = gymDaysMap[formData.gymDays] || 'moderate';

      // Calculate targets
      const targets = calculateRecompTargets(
        parseFloat(formData.weightKg),
        heightCm,
        parseInt(formData.age),
        formData.gender,
        activityLevel
      );

      const result = await updateUserProfile(userId, {
        weightKg: parseFloat(formData.weightKg),
        heightCm: heightCm,
        age: parseInt(formData.age),
        bodyFatPercent: parseFloat(formData.bodyFatPercent),
        gender: formData.gender,
        activityLevel: activityLevel,
        targetCalories: targets.recompCalories,
        targetProtein: targets.protein,
        targetFats: targets.fats,
        targetCarbs: targets.carbs,
      });

      if (result.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          router.refresh();
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      {/* Navigation Sidebar */}
      <NavigationSidebar />
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">⚙️ Settings</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg) *
                </label>
                <input
                  id="weightKg"
                  name="weightKg"
                  type="number"
                  step="0.1"
                  value={formData.weightKg}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="heightFeet" className="block text-sm font-medium text-gray-700 mb-1">
                  Height *
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      id="heightFeet"
                      name="heightFeet"
                      type="number"
                      min="0"
                      max="8"
                      placeholder="Feet"
                      value={formData.heightFeet}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      id="heightInches"
                      name="heightInches"
                      type="number"
                      min="0"
                      max="11"
                      placeholder="Inches"
                      value={formData.heightInches}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="bodyFatPercent" className="block text-sm font-medium text-gray-700 mb-1">
                  Body Fat % (approx) *
                </label>
                <input
                  id="bodyFatPercent"
                  name="bodyFatPercent"
                  type="number"
                  step="0.1"
                  value={formData.bodyFatPercent}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label htmlFor="gymDays" className="block text-sm font-medium text-gray-700 mb-1">
                  Gym Days per Week *
                </label>
                <select
                  id="gymDays"
                  name="gymDays"
                  value={formData.gymDays}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="0">0 days</option>
                  <option value="1">1 day</option>
                  <option value="2">2 days</option>
                  <option value="3">3 days</option>
                  <option value="4">4 days</option>
                  <option value="5">5 days</option>
                  <option value="6">6 days</option>
                  <option value="7">7 days</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

