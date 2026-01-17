'use client';

import { useState } from 'react';
import { calculateRecompTargets } from '@/lib/calculations/recomp';
import { addFoodEntry, deleteFoodEntry } from '@/lib/actions/foods';
import { useRouter } from 'next/navigation';
import { recompConfig } from '@/lib/config';
import NavigationSidebar from '@/components/dashboard/NavigationSidebar';
import CalendarModal from '@/components/dashboard/CalendarModal';
import AddCustomFoodModal from '@/components/dashboard/AddCustomFoodModal';
import { format } from 'date-fns';

interface DashboardClientProps {
  profile: any;
  dailyLog: any;
  foods: any[];
  userId: string;
  allDailyLogs: Array<{
    date: string;
    totalCalories?: number;
    totalProtein?: number;
    totalCarbs?: number;
    totalFats?: number;
  }>;
  currentDate?: string;
}

export default function DashboardClient({ profile, dailyLog, foods, userId, allDailyLogs, currentDate }: DashboardClientProps) {
  const router = useRouter();
  const [selectedFood, setSelectedFood] = useState('');
  const [selectedFoodObj, setSelectedFoodObj] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  
  const currentDateStr = currentDate || format(new Date(), 'yyyy-MM-dd');

  // Recalculate targets to show formulas
  const targets = calculateRecompTargets(
    profile.weightKg,
    profile.heightCm,
    profile.age,
    profile.gender,
    profile.activityLevel
  );

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood || !quantity || !selectedFoodObj) {
      setError('Please select a food and enter a quantity');
      return;
    }

    setError('');
    setLoading(true);
    
    // Convert quantity to grams based on unit
    let quantityToStore: number;
    if (selectedFoodObj.unit === 'piece') {
      quantityToStore = parseFloat(quantity); // Store piece count directly (for eggs, cookies, etc.)
    } else if (selectedFoodObj.unit !== 'g' && selectedFoodObj.unitSize) {
      // For tsp, tbsp, slice, etc. - convert to grams using unitSize
      quantityToStore = parseFloat(quantity) * selectedFoodObj.unitSize;
    } else {
      quantityToStore = parseFloat(quantity); // Already in grams
    }
    
    const result = await addFoodEntry(userId, selectedFood, quantityToStore);
    
    if (result.success) {
      router.refresh();
      setSelectedFood('');
      setSelectedFoodObj(null);
      setQuantity('');
    } else {
      setError(result.error || 'Failed to add food entry. Please try again.');
    }
    setLoading(false);
  };

  const handleDeleteEntry = async (entryId: string) => {
    const result = await deleteFoodEntry(entryId, userId);
    if (result.success) {
      router.refresh();
    }
  };

  const todayTotals = dailyLog?.totals || { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const progress = {
    calories: (todayTotals.calories / targets.recompCalories) * 100,
    protein: (todayTotals.protein / targets.protein) * 100,
    carbs: (todayTotals.carbs / targets.carbs) * 100,
    fats: (todayTotals.fats / targets.fats) * 100,
  };

  const expectedIntake = Math.round((targets.recompCalories + recompConfig.recomp.intakeBufferMin + targets.recompCalories + recompConfig.recomp.intakeBufferMax) / 2);
  const effectiveDeficit = targets.maintenance - expectedIntake;
  const effectiveDeficitPercent = Math.round((effectiveDeficit / targets.maintenance) * 100 * 100) / 100;

  const handleDateSelect = (date: string) => {
    if (date === format(new Date(), 'yyyy-MM-dd')) {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard?date=${date}`);
    }
    router.refresh();
  };

  const goToToday = () => {
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4 relative">
      {/* Navigation Sidebar */}
      <NavigationSidebar />

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        dailyLogs={allDailyLogs}
        currentDate={currentDateStr}
        onDateSelect={handleDateSelect}
      />

      {/* Add Custom Food Modal */}
      <AddCustomFoodModal
        isOpen={isAddFoodModalOpen}
        onClose={() => setIsAddFoodModalOpen(false)}
        userId={userId}
        onFoodAdded={(foodId, foodName) => {
          // After adding food, refresh to get updated food list
          router.refresh();
        }}
      />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {currentDateStr !== format(new Date(), 'yyyy-MM-dd') && (
              <button
                onClick={goToToday}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
              >
                Go to Today
              </button>
            )}
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center gap-2 text-sm sm:text-base"
            >
              📅 <span className="hidden sm:inline">Calendar</span>
            </button>
            {currentDateStr !== format(new Date(), 'yyyy-MM-dd') && (
              <span className="text-xs sm:text-sm text-gray-600">
                {format(new Date(currentDateStr), 'MMM dd, yyyy')}
              </span>
            )}
          </div>
        </div>

        {/* Goals Summary Card */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-blue-200">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 border-b-2 border-gray-300 pb-2 sm:pb-3">
            🎯 Your Recomp Goals
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Macro-defined Calories</div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{targets.recompCalories} kcal</div>
            </div>

            <div className="bg-teal-50 p-3 sm:p-4 rounded-lg border border-teal-200">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Expected Intake Range</div>
              <div className="text-lg sm:text-2xl font-bold text-teal-600">
                {targets.recompCalories + recompConfig.recomp.intakeBufferMin} - {targets.recompCalories + recompConfig.recomp.intakeBufferMax} kcal
              </div>
            </div>

            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Effective Deficit</div>
              <div className="text-lg sm:text-2xl font-bold text-slate-600">{effectiveDeficit} kcal ({effectiveDeficitPercent}%)</div>
            </div>

            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Maintenance</div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{targets.maintenance} kcal</div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-600">Protein</div>
              <div className="text-lg sm:text-xl font-bold text-yellow-600">{targets.protein} g</div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-600">Carbs</div>
              <div className="text-lg sm:text-xl font-bold text-orange-600">{targets.carbs} g</div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-600">Fats</div>
              <div className="text-lg sm:text-xl font-bold text-pink-600">{targets.fats} g</div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-600">Upper Bound</div>
              <div className="text-lg sm:text-xl font-bold text-purple-600">{targets.maintenance - recompConfig.recomp.subtractValue} kcal</div>
            </div>
          </div>
        </div>

        {/* Daily Targets vs Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 mb-2">Calories</div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">{todayTotals.calories} / {targets.recompCalories}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progress.calories, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{Math.round(progress.calories)}%</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 mb-2">Protein</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">{todayTotals.protein} / {targets.protein}g</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progress.protein, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{Math.round(progress.protein)}%</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 mb-2">Carbs</div>
            <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">{todayTotals.carbs} / {targets.carbs}g</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progress.carbs, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{Math.round(progress.carbs)}%</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 mb-2">Fats</div>
            <div className="text-2xl sm:text-3xl font-bold text-pink-600 mb-2">{todayTotals.fats} / {targets.fats}g</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-pink-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progress.fats, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{Math.round(progress.fats)}%</div>
          </div>
        </div>

        {/* Food Entry Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Add Food Entry</h2>
            <button
              onClick={() => setIsAddFoodModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            >
              ➕ Add Custom Food
            </button>
          </div>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleAddFood} className="flex gap-4">
            <select
              value={selectedFood}
              onChange={(e) => {
                setSelectedFood(e.target.value);
                const food = foods.find(f => f.id === e.target.value);
                setSelectedFoodObj(food || null);
                setQuantity('');
              }}
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">Select a food</option>
              {foods.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={selectedFoodObj?.unit === 'g' ? 'Quantity (g)' : `Quantity (${selectedFoodObj?.unit || 'g'})`}
                required
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
              {selectedFoodObj && selectedFoodObj.unit === 'piece' && (
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {selectedFoodObj.unit}(s)
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </form>
        </div>

        {/* Today's Log Entries */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Today's Log</h2>
          {dailyLog && dailyLog.entries.length > 0 ? (
            <div className="space-y-2">
              {dailyLog.entries.map((entry: any) => (
                <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded border gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">{entry.food.name}</div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {(() => {
                        // If piece-based food, use per-piece calculation (quantity IS piece count)
                        if (entry.food.unit === 'piece' && entry.food.caloriesPerPiece) {
                          const pieces = entry.quantity; // Quantity IS piece count
                          const calories = (entry.food.caloriesPerPiece || 0) * pieces;
                          const protein = (entry.food.proteinPerPiece || 0) * pieces;
                          const carbs = (entry.food.carbsPerPiece || 0) * pieces;
                          const fats = (entry.food.fatsPerPiece || 0) * pieces;
                          return `${pieces} ${entry.food.unit}(s) • ${Math.round(calories)} cal • P: ${protein.toFixed(1)}g • C: ${carbs.toFixed(1)}g • F: ${fats.toFixed(1)}g`;
                        }
                        
                        // For tsp, tbsp, slice, etc. - convert back from grams to original unit
                        if (entry.food.unit !== 'g' && entry.food.unit !== 'piece' && entry.food.unitSize) {
                          const units = entry.quantity / entry.food.unitSize;
                          const calories = (entry.food.caloriesPer100g || 0) * (entry.quantity / 100);
                          const protein = (entry.food.proteinPer100g || 0) * (entry.quantity / 100);
                          const carbs = (entry.food.carbsPer100g || 0) * (entry.quantity / 100);
                          const fats = (entry.food.fatsPer100g || 0) * (entry.quantity / 100);
                          return `${units.toFixed(1)} ${entry.food.unit}(s) • ${Math.round(calories)} cal • P: ${protein.toFixed(1)}g • C: ${carbs.toFixed(1)}g • F: ${fats.toFixed(1)}g`;
                        }
                        
                        // Otherwise use per-100g calculation for gram-based foods
                        return `${entry.quantity}g • ${Math.round((entry.food.caloriesPer100g * entry.quantity) / 100)} cal • P: ${((entry.food.proteinPer100g * entry.quantity) / 100).toFixed(1)}g • C: ${((entry.food.carbsPer100g * entry.quantity) / 100).toFixed(1)}g • F: ${((entry.food.fatsPer100g * entry.quantity) / 100).toFixed(1)}g`;
                      })()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-red-600 hover:text-red-800 px-3 py-1 text-sm sm:text-base self-start sm:self-auto"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No entries for today. Start adding foods!</div>
          )}
        </div>
      </div>
    </div>
  );
}

