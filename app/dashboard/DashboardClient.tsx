'use client';

import { useState, useEffect } from 'react';
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
  const [selectedUnit, setSelectedUnit] = useState<'tsp' | 'tbsp' | null>(null); // For oil unit switching
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  
  // Use client-side date to ensure correct timezone
  const [clientToday, setClientToday] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const currentDateStr = currentDate || clientToday;
  
  // Check if date has changed (e.g., after midnight)
  useEffect(() => {
    const checkDateChange = () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      if (today !== clientToday) {
        setClientToday(today);
        // If viewing today's date (no date param or date matches old today), refresh to show new day
        const isViewingToday = !currentDate || currentDate === clientToday;
        if (isViewingToday) {
          router.push('/dashboard');
          router.refresh();
        }
      }
    };
    
    // Check immediately
    checkDateChange();
    
    // Check every minute to catch midnight transitions
    const interval = setInterval(checkDateChange, 60000);
    
    return () => clearInterval(interval);
  }, [clientToday, currentDate, router]);

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
    if (selectedFoodObj.name === 'Oil (any)') {
      // Special handling for oil - use selected unit (tsp or tbsp)
      // 1 tsp = 5g, 1 tbsp = 15g
      const unitSize = selectedUnit === 'tbsp' ? 15 : 5;
      quantityToStore = parseFloat(quantity) * unitSize;
    } else if (selectedFoodObj.unit === 'piece' && selectedFoodObj.caloriesPerPiece && !selectedFoodObj.unitSize) {
      // Piece-based foods with per-piece values (eggs, cookies, roti) - store piece count directly
      quantityToStore = parseFloat(quantity);
    } else if (selectedFoodObj.unitSize && selectedFoodObj.unit !== 'g') {
      // For foods with unitSize (tsp, tbsp, slice, piece with unitSize, etc.) - convert to grams
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 relative">
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
          <h1 className="text-3xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {currentDateStr !== clientToday && (
              <button
                onClick={goToToday}
                className="px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-base font-medium min-h-[44px]"
              >
                Go to Today
              </button>
            )}
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="px-5 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center gap-2 text-base font-medium min-h-[44px]"
            >
              📅 <span className="hidden sm:inline">Calendar</span>
            </button>
            {currentDateStr !== clientToday && (
              <span className="text-sm text-gray-600">
                {format(new Date(currentDateStr), 'MMM dd, yyyy')}
              </span>
            )}
          </div>
        </div>

        {/* Goals Summary Card */}
        <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6 mb-5 sm:mb-6 border-2 border-blue-200">
          <h2 className="text-2xl sm:text-2xl font-bold mb-5 sm:mb-6 text-gray-900 border-b-2 border-gray-300 pb-3 sm:pb-3">
            🎯 Your Recomp Goals
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-blue-50 p-4 sm:p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600 mb-2">Macro-defined Calories</div>
              <div className="text-2xl sm:text-2xl font-bold text-blue-600">{targets.recompCalories} kcal</div>
            </div>

            <div className="bg-teal-50 p-4 sm:p-4 rounded-lg border border-teal-200">
              <div className="text-sm text-gray-600 mb-2">Expected Intake Range</div>
              <div className="text-xl sm:text-2xl font-bold text-teal-600">
                {targets.recompCalories + recompConfig.recomp.intakeBufferMin} - {targets.recompCalories + recompConfig.recomp.intakeBufferMax} kcal
              </div>
            </div>

            <div className="bg-slate-50 p-4 sm:p-4 rounded-lg border border-slate-200">
              <div className="text-sm text-gray-600 mb-2">Effective Deficit</div>
              <div className="text-xl sm:text-2xl font-bold text-slate-600">{effectiveDeficit} kcal ({effectiveDeficitPercent}%)</div>
            </div>

            <div className="bg-purple-50 p-4 sm:p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-gray-600 mb-2">Maintenance</div>
              <div className="text-2xl sm:text-2xl font-bold text-purple-600">{targets.maintenance} kcal</div>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Protein</div>
              <div className="text-xl sm:text-xl font-bold text-yellow-600">{targets.protein} g</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Carbs</div>
              <div className="text-xl sm:text-xl font-bold text-orange-600">{targets.carbs} g</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Fats</div>
              <div className="text-xl sm:text-xl font-bold text-pink-600">{targets.fats} g</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Upper Bound</div>
              <div className="text-xl sm:text-xl font-bold text-purple-600">{targets.maintenance - recompConfig.recomp.subtractValue} kcal</div>
            </div>
          </div>
        </div>

        {/* Daily Targets vs Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 mb-5 sm:mb-6">
          <div className="bg-white rounded-lg shadow-md p-5 sm:p-6">
            <div className="text-sm text-gray-600 mb-3">Calories</div>
            <div className="text-3xl sm:text-3xl font-bold text-blue-600 mb-3">{todayTotals.calories} / {targets.recompCalories}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progress.calories, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{Math.round(progress.calories)}%</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5 sm:p-6">
            <div className="text-sm text-gray-600 mb-3">Protein</div>
            <div className="text-3xl sm:text-3xl font-bold text-green-600 mb-3">{todayTotals.protein} / {targets.protein}g</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progress.protein, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{Math.round(progress.protein)}%</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5 sm:p-6">
            <div className="text-sm text-gray-600 mb-3">Carbs</div>
            <div className="text-3xl sm:text-3xl font-bold text-orange-600 mb-3">{todayTotals.carbs} / {targets.carbs}g</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progress.carbs, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{Math.round(progress.carbs)}%</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5 sm:p-6">
            <div className="text-sm text-gray-600 mb-3">Fats</div>
            <div className="text-3xl sm:text-3xl font-bold text-pink-600 mb-3">{todayTotals.fats} / {targets.fats}g</div>
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
        <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 mb-5 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-4">
            <h2 className="text-xl sm:text-xl font-semibold text-gray-900">Add Food Entry</h2>
            <button
              onClick={() => setIsAddFoodModalOpen(true)}
              className="px-5 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-base font-medium whitespace-nowrap min-h-[44px]"
            >
              ➕ Add Custom Food
            </button>
          </div>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-base">
              {error}
            </div>
          )}
          <form onSubmit={handleAddFood} className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedFood}
              onChange={(e) => {
                setSelectedFood(e.target.value);
                const food = foods.find(f => f.id === e.target.value);
                setSelectedFoodObj(food || null);
                setQuantity('');
                // Reset unit selector when food changes
                if (food?.name === 'Oil (any)') {
                  setSelectedUnit('tsp'); // Default to tsp
                } else {
                  setSelectedUnit(null);
                }
              }}
              required
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-base min-h-[44px]"
            >
              <option value="">Select a food</option>
              {foods.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-3">
              {/* Unit selector for Oil */}
              {selectedFoodObj?.name === 'Oil (any)' && (
                <select
                  value={selectedUnit || 'tsp'}
                  onChange={(e) => {
                    setSelectedUnit(e.target.value as 'tsp' | 'tbsp');
                    setQuantity(''); // Reset quantity when unit changes
                  }}
                  className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-base min-h-[44px]"
                >
                  <option value="tsp">tsp</option>
                  <option value="tbsp">tbsp</option>
                </select>
              )}
              <input
                type="number"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={
                  selectedFoodObj?.name === 'Oil (any)' 
                    ? `Quantity (${selectedUnit || 'tsp'})` 
                    : selectedFoodObj?.unit === 'g' 
                      ? 'Quantity (g)' 
                      : `Quantity (${selectedFoodObj?.unit || 'g'})`
                }
                required
                className="w-32 sm:w-32 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-base min-h-[44px]"
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
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium whitespace-nowrap min-h-[44px]"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </form>
        </div>

        {/* Today's Log Entries */}
        <div className="bg-white rounded-lg shadow-md p-5 sm:p-6">
          <h2 className="text-xl sm:text-xl font-semibold mb-5 text-gray-900">Today's Log</h2>
          {dailyLog && dailyLog.entries.length > 0 ? (
            <div className="space-y-3">
              {dailyLog.entries.map((entry: any) => (
                <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded border gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-base mb-1">{entry.food.name}</div>
                    <div className="text-sm text-gray-600">
                      {(() => {
                        // Debug: Log entry data if unitSize is missing (only in development)
                        if (process.env.NODE_ENV === 'development' && entry.food.unit !== 'g' && !entry.food.unitSize && entry.food.name !== 'Oil (any)' && !entry.food.caloriesPerPiece) {
                          console.log('Food entry debug - missing unitSize:', {
                            name: entry.food.name,
                            unit: entry.food.unit,
                            unitSize: entry.food.unitSize,
                            quantity: entry.quantity,
                            hasCaloriesPerPiece: !!entry.food.caloriesPerPiece,
                            foodObject: entry.food
                          });
                        }
                        
                        // Special handling for Oil - can be tsp or tbsp
                        if (entry.food.name === 'Oil (any)') {
                          // Determine if it was tbsp (15g) or tsp (5g) based on quantity
                          // If divisible by 15 and >= 15, prefer tbsp; otherwise tsp
                          const isTbsp = entry.quantity >= 15 && entry.quantity % 15 === 0;
                          const isTsp = entry.quantity < 15 || (entry.quantity % 15 !== 0 && entry.quantity % 5 === 0);
                          
                          let unit: 'tsp' | 'tbsp';
                          let unitSize: number;
                          let units: number;
                          
                          if (isTbsp) {
                            unit = 'tbsp';
                            unitSize = 15;
                            units = entry.quantity / 15;
                          } else {
                            unit = 'tsp';
                            unitSize = 5;
                            units = entry.quantity / 5;
                          }
                          
                          const calories = (entry.food.caloriesPer100g || 0) * (entry.quantity / 100);
                          const protein = (entry.food.proteinPer100g || 0) * (entry.quantity / 100);
                          const carbs = (entry.food.carbsPer100g || 0) * (entry.quantity / 100);
                          const fats = (entry.food.fatsPer100g || 0) * (entry.quantity / 100);
                          return `${units.toFixed(1)} ${unit}(s) • ${Math.round(calories)} cal • P: ${protein.toFixed(1)}g • C: ${carbs.toFixed(1)}g • F: ${fats.toFixed(1)}g`;
                        }
                        
                        // Priority 1: Foods with unitSize (custom foods, tsp, tbsp, slice, piece with unitSize, etc.)
                        // Convert back from grams to original unit
                        // This takes priority because if unitSize exists, quantity is stored in grams
                        if (entry.food.unitSize != null && entry.food.unitSize > 0 && entry.food.unit !== 'g' && entry.quantity != null && !isNaN(entry.quantity)) {
                          const units = entry.quantity / entry.food.unitSize;
                          if (!isNaN(units) && isFinite(units) && units > 0) {
                            const calories = (entry.food.caloriesPer100g || 0) * (entry.quantity / 100);
                            const protein = (entry.food.proteinPer100g || 0) * (entry.quantity / 100);
                            const carbs = (entry.food.carbsPer100g || 0) * (entry.quantity / 100);
                            const fats = (entry.food.fatsPer100g || 0) * (entry.quantity / 100);
                            return `${units.toFixed(1)} ${entry.food.unit}(s) • ${Math.round(calories)} cal • P: ${protein.toFixed(1)}g • C: ${carbs.toFixed(1)}g • F: ${fats.toFixed(1)}g`;
                          }
                        }
                        
                        // Priority 2: Piece-based foods with per-piece values (eggs, cookies, roti)
                        // Quantity IS piece count, not grams
                        if (entry.food.unit === 'piece' && entry.food.caloriesPerPiece) {
                          const pieces = entry.quantity; // Quantity IS piece count
                          const calories = (entry.food.caloriesPerPiece || 0) * pieces;
                          const protein = (entry.food.proteinPerPiece || 0) * pieces;
                          const carbs = (entry.food.carbsPerPiece || 0) * pieces;
                          const fats = (entry.food.fatsPerPiece || 0) * pieces;
                          return `${pieces} ${entry.food.unit}(s) • ${Math.round(calories)} cal • P: ${protein.toFixed(1)}g • C: ${carbs.toFixed(1)}g • F: ${fats.toFixed(1)}g`;
                        }
                        
                        // Priority 3: For other non-gram units without unitSize (shouldn't happen, but fallback)
                        // This handles cases where custom food was created with unit but no unitSize
                        if (entry.food.unit !== 'g' && !entry.food.unitSize && !entry.food.caloriesPerPiece) {
                          // If no unitSize and no per-piece values, treat as grams (fallback)
                          // This is a data issue - the food should have unitSize set
                          console.warn(`Food "${entry.food.name}" has unit "${entry.food.unit}" but no unitSize. Please update the food to include unitSize.`);
                          const calories = (entry.food.caloriesPer100g || 0) * (entry.quantity / 100);
                          const protein = (entry.food.proteinPer100g || 0) * (entry.quantity / 100);
                          const carbs = (entry.food.carbsPer100g || 0) * (entry.quantity / 100);
                          const fats = (entry.food.fatsPer100g || 0) * (entry.quantity / 100);
                          return `${entry.quantity}g • ${Math.round(calories)} cal • P: ${protein.toFixed(1)}g • C: ${carbs.toFixed(1)}g • F: ${fats.toFixed(1)}g`;
                        }
                        
                        // Otherwise use per-100g calculation for gram-based foods
                        return `${entry.quantity}g • ${Math.round((entry.food.caloriesPer100g * entry.quantity) / 100)} cal • P: ${((entry.food.proteinPer100g * entry.quantity) / 100).toFixed(1)}g • C: ${((entry.food.carbsPer100g * entry.quantity) / 100).toFixed(1)}g • F: ${((entry.food.fatsPer100g * entry.quantity) / 100).toFixed(1)}g`;
                      })()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-red-600 hover:text-red-800 px-4 py-2 text-base font-medium self-start sm:self-auto min-h-[44px] min-w-[80px]"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8 text-base">No entries for today. Start adding foods!</div>
          )}
        </div>
      </div>
    </div>
  );
}

