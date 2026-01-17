'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserProfile, getCurrentUserId } from '@/lib/actions/auth';
import { calculateRecompTargets } from '@/lib/calculations/recomp';
import { recompConfig } from '@/lib/config';

export default function SetupPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    weightKg: '',
    heightFeet: '',
    heightInches: '',
    age: '',
    bodyFatPercent: '',
    gender: 'male' as 'male' | 'female',
    gymDays: '3' as '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [targets, setTargets] = useState<any>(null);

  // Get userId from cookie on mount
  useEffect(() => {
    async function fetchUserId() {
      try {
        const result = await getCurrentUserId();
        if (!result.success || !result.userId) {
          router.push('/login');
        } else {
          setUserId(result.userId);
        }
      } catch (err) {
        console.error('Error getting userId:', err);
        router.push('/login');
      }
    }
    fetchUserId();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    
    // Calculate targets if all fields filled (using updated data)
    const weight = parseFloat(updatedFormData.weightKg || '0');
    const feet = parseFloat(updatedFormData.heightFeet || '0');
    const inches = parseFloat(updatedFormData.heightInches || '0');
    const age = parseInt(updatedFormData.age || '0');
    
    if (weight && feet && age && updatedFormData.gender && updatedFormData.gymDays) {
      calculateTargets(updatedFormData);
    }
  };

  const calculateTargets = (data = formData) => {
    const weight = parseFloat(data.weightKg);
    const feet = parseFloat(data.heightFeet || '0');
    const inches = parseFloat(data.heightInches || '0');
    const age = parseInt(data.age);
    
    // Convert feet and inches to cm
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
    const activityLevel = gymDaysMap[data.gymDays] || 'moderate';

    if (weight && heightCm && age) {
      const calculated = calculateRecompTargets(
        weight,
        heightCm,
        age,
        data.gender,
        activityLevel
      );
      setTargets(calculated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!userId) {
        setError('Please login first');
        router.push('/login');
        setLoading(false);
        return;
      }

      if (!targets) {
        setError('Please fill all fields to calculate targets');
        setLoading(false);
        return;
      }

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

      const result = await createUserProfile(userId, {
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
        router.push('/dashboard');
      } else {
        setError(result.error || 'Failed to save profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Setup Your Profile
        </h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
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

            {targets && (
              <div className="mt-6">
                {/* Summary Targets */}
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Recomp Targets</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Calories</div>
                      <div className="text-2xl font-bold text-blue-600">{targets.recompCalories}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Protein (g)</div>
                      <div className="text-2xl font-bold text-blue-600">{targets.protein}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Carbs (g)</div>
                      <div className="text-2xl font-bold text-blue-600">{targets.carbs}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Fats (g)</div>
                      <div className="text-2xl font-bold text-blue-600">{targets.fats}</div>
                    </div>
                  </div>
                </div>

                {/* Detailed Calculation Formulas */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b-2 border-gray-300 pb-3">
                    📊 Calculation Formulas
                  </h2>
                  
                  <div className="space-y-5">
                    <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-600 shadow-sm">
                      <div className="font-bold text-lg mb-3 text-blue-900">1. Height Conversion:</div>
                      <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
                        Height = ({formData.heightFeet || '0'} ft × 12 + {formData.heightInches || '0'} in) × 2.54
                        <br />
                        <span className="text-lg font-bold text-blue-700">= {Math.round(((parseFloat(formData.heightFeet || '0') * 12) + parseFloat(formData.heightInches || '0')) * 2.54)} cm</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-600 shadow-sm">
                      <div className="font-bold text-lg mb-3 text-blue-900">2. BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation:</div>
                      <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
                        {formData.gender === 'male' ? (
                          <>BMR = 10 × <span className="font-bold text-blue-600">{formData.weightKg || '0'}</span> + 6.25 × <span className="font-bold text-blue-600">{Math.round(((parseFloat(formData.heightFeet || '0') * 12) + parseFloat(formData.heightInches || '0')) * 2.54)}</span> - 5 × <span className="font-bold text-blue-600">{formData.age || '0'}</span> + 5</>
                        ) : (
                          <>BMR = 10 × <span className="font-bold text-blue-600">{formData.weightKg || '0'}</span> + 6.25 × <span className="font-bold text-blue-600">{Math.round(((parseFloat(formData.heightFeet || '0') * 12) + parseFloat(formData.heightInches || '0')) * 2.54)}</span> - 5 × <span className="font-bold text-blue-600">{formData.age || '0'}</span> - 161</>
                        )}
                        <br />
                        <span className="text-lg font-bold text-blue-700">= {targets.bmr} kcal</span>
                      </div>
                    </div>

                    <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-600 shadow-sm">
                      <div className="font-bold text-lg mb-3 text-green-900">3. Activity Multiplier (Fixed):</div>
                      <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
                        Activity Multiplier = <span className="font-bold text-green-600">{recompConfig.activity.multiplier}</span> (fixed for recomp)
                      </div>
                    </div>

                    <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-600 shadow-sm">
                      <div className="font-bold text-lg mb-3 text-green-900">4. Maintenance Calories:</div>
                      <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
                        Maintenance = <span className="font-bold text-green-600">{targets.bmr}</span> × <span className="font-bold text-green-600">{recompConfig.activity.multiplier}</span>
                        <br />
                        <span className="text-lg font-bold text-green-700">= {targets.maintenance} kcal</span>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-5 rounded-lg border-l-4 border-purple-600 shadow-sm">
                      <div className="font-bold text-lg mb-3 text-purple-900">5. Upper Bound (Soft Target):</div>
                      <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
                        Upper Bound = <span className="font-bold text-purple-600">{targets.maintenance}</span> - <span className="font-bold text-purple-600">{recompConfig.recomp.subtractValue}</span>
                        <br />
                        <span className="text-lg font-bold text-purple-700">= {targets.maintenance - recompConfig.recomp.subtractValue} kcal</span>
                        <br />
                        <span className="text-sm text-gray-600 mt-2 block">(Soft upper bound used for carb calculation. Macros are the hard constraints, calories are an output.)</span>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-600 shadow-sm">
                      <div className="font-bold text-lg mb-3 text-yellow-900">6. Protein (g):</div>
                      <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
                        Protein = {recompConfig.protein.ratioPerKg} × <span className="font-bold text-yellow-600">{formData.weightKg || '0'}</span>
                        <br />
                        <span className="text-lg font-bold text-yellow-700">= {targets.protein} g</span> ({(targets.protein * recompConfig.protein.caloriesPerGram)} kcal from protein)
                      </div>
                    </div>

                    <div className="bg-pink-50 p-5 rounded-lg border-l-4 border-pink-600 shadow-sm">
                      <div className="font-bold text-lg mb-3 text-pink-900">7. Fats (g):</div>
                      <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
                        Fats = {recompConfig.fat.ratioPerKg} × <span className="font-bold text-pink-600">{formData.weightKg || '0'}</span>
                        <br />
                        <span className="text-lg font-bold text-pink-700">= {targets.fats} g</span> ({(targets.fats * recompConfig.fat.caloriesPerGram)} kcal from fats)
                      </div>
                    </div>

                    <div className="bg-orange-50 p-5 rounded-lg border-l-4 border-orange-600 shadow-sm">
                      <div className="font-bold text-lg mb-3 text-orange-900">8. Carbs (g) - Calculated & Capped:</div>
                      <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
                        {(() => {
                          const targetRecomp = targets.maintenance - recompConfig.recomp.subtractValue;
                          const remainingCalories = targetRecomp - targets.proteinCalories - targets.fatCalories;
                          const calculatedCarbs = Math.round(remainingCalories / 4);
                          return (
                            <>
                              Remaining Calories = {targetRecomp} (upper bound) - {targets.proteinCalories} - {targets.fatCalories} = {remainingCalories}
                              <br />
                              Calculated Carbs = {remainingCalories} ÷ 4 = {calculatedCarbs}g
                              <br />
                              Capped Carbs = min({calculatedCarbs}, {recompConfig.carbs.max})
                              <br />
                              <span className="text-lg font-bold text-orange-700">= {targets.carbs} g</span> ({(targets.carbs * recompConfig.carbs.caloriesPerGram)} kcal from carbs)
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="bg-indigo-50 p-5 rounded-lg border-l-4 border-indigo-600 shadow-sm">
                      <div className="font-bold text-lg mb-3 text-indigo-900">9. Macro-defined Calories:</div>
                      <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
                        Macro Total = {targets.proteinCalories} (protein) + {targets.fatCalories} (fats) + {targets.carbCalories} (carbs)
                        <br />
                        <span className="text-lg font-bold text-indigo-700">= {targets.recompCalories} kcal</span>
                        <br />
                        <span className="text-sm text-gray-600 mt-2 block">(Macro floor - actual intake will be higher due to cooking oil, variance, etc.)</span>
                      </div>
                    </div>

                    <div className="bg-teal-50 p-5 rounded-lg border-l-4 border-teal-600 shadow-sm">
                      <div className="font-bold text-lg mb-3 text-teal-900">10. Expected Real Intake Range:</div>
                      <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
                        Expected Intake = {targets.recompCalories} (macro floor) + {recompConfig.recomp.intakeBufferMin}-{recompConfig.recomp.intakeBufferMax} (buffer)
                        <br />
                        <span className="text-lg font-bold text-teal-700">= {targets.recompCalories + recompConfig.recomp.intakeBufferMin} - {targets.recompCalories + recompConfig.recomp.intakeBufferMax} kcal</span>
                        <br />
                        <span className="text-sm text-gray-600 mt-2 block">(Accounts for cooking oil, sabzi, roti/fruit variance, etc.)</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-lg border-l-4 border-slate-600 shadow-sm">
                      <div className="font-bold text-lg mb-3 text-slate-900">11. Effective Deficit:</div>
                      <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
                        {(() => {
                          const expectedIntake = Math.round((targets.recompCalories + recompConfig.recomp.intakeBufferMin + targets.recompCalories + recompConfig.recomp.intakeBufferMax) / 2);
                          const effectiveDeficit = targets.maintenance - expectedIntake;
                          const effectiveDeficitPercent = Math.round((effectiveDeficit / targets.maintenance) * 100 * 100) / 100;
                          return (
                            <>
                              Effective Deficit = {targets.maintenance} (maintenance) - {expectedIntake} (expected intake)
                              <br />
                              <span className="text-lg font-bold text-slate-700">= {effectiveDeficit} kcal ({effectiveDeficitPercent}% deficit)</span>
                              <br />
                              <span className="text-sm text-gray-600 mt-2 block">(Based on expected real intake range, not macro floor)</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !targets}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

