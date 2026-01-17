'use client';

import { calculateRecompTargets } from '@/lib/calculations/recomp';
import { recompConfig } from '@/lib/config';
import NavigationSidebar from '@/components/dashboard/NavigationSidebar';

interface CalculationsPageClientProps {
  profile: any;
}

export default function CalculationsPageClient({ profile }: CalculationsPageClientProps) {
  const targets = calculateRecompTargets(
    profile.weightKg,
    profile.heightCm,
    profile.age,
    profile.gender,
    profile.activityLevel
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      {/* Navigation Sidebar */}
      <NavigationSidebar />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">📊 Recomp Calculations</h1>

        <div className="space-y-5">
          <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-600 shadow-sm">
            <div className="font-bold text-lg mb-3 text-blue-900">1. BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation:</div>
            <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
              {profile.gender === 'male' ? (
                <>BMR = 10 × <span className="font-bold text-blue-600">{profile.weightKg}</span> + 6.25 × <span className="font-bold text-blue-600">{profile.heightCm}</span> - 5 × <span className="font-bold text-blue-600">{profile.age}</span> + 5</>
              ) : (
                <>BMR = 10 × <span className="font-bold text-blue-600">{profile.weightKg}</span> + 6.25 × <span className="font-bold text-blue-600">{profile.heightCm}</span> - 5 × <span className="font-bold text-blue-600">{profile.age}</span> - 161</>
              )}
              <br />
              <span className="text-lg font-bold text-blue-700">= {targets.bmr} kcal</span>
            </div>
          </div>

          <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-600 shadow-sm">
            <div className="font-bold text-lg mb-3 text-green-900">2. Activity Multiplier (Fixed):</div>
            <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
              Activity Multiplier = <span className="font-bold text-green-600">{recompConfig.activity.multiplier}</span> (fixed for recomp)
            </div>
          </div>

          <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-600 shadow-sm">
            <div className="font-bold text-lg mb-3 text-green-900">3. Maintenance Calories:</div>
            <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
              Maintenance = <span className="font-bold text-green-600">{targets.bmr}</span> × <span className="font-bold text-green-600">{recompConfig.activity.multiplier}</span>
              <br />
              <span className="text-lg font-bold text-green-700">= {targets.maintenance} kcal</span>
            </div>
          </div>

          <div className="bg-purple-50 p-5 rounded-lg border-l-4 border-purple-600 shadow-sm">
            <div className="font-bold text-lg mb-3 text-purple-900">4. Upper Bound (Soft Target):</div>
            <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
              Upper Bound = <span className="font-bold text-purple-600">{targets.maintenance}</span> - <span className="font-bold text-purple-600">{recompConfig.recomp.subtractValue}</span>
              <br />
              <span className="text-lg font-bold text-purple-700">= {targets.maintenance - recompConfig.recomp.subtractValue} kcal</span>
              <br />
              <span className="text-sm text-gray-600 mt-2 block">(Soft upper bound used for carb calculation. Macros are the hard constraints, calories are an output.)</span>
            </div>
          </div>

          <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-600 shadow-sm">
            <div className="font-bold text-lg mb-3 text-yellow-900">5. Protein (g):</div>
            <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
              Protein = {recompConfig.protein.ratioPerKg} × <span className="font-bold text-yellow-600">{profile.weightKg}</span>
              <br />
              <span className="text-lg font-bold text-yellow-700">= {targets.protein} g</span> ({(targets.protein * 4)} kcal from protein)
            </div>
          </div>

          <div className="bg-pink-50 p-5 rounded-lg border-l-4 border-pink-600 shadow-sm">
            <div className="font-bold text-lg mb-3 text-pink-900">6. Fats (g):</div>
            <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
              Fats = {recompConfig.fat.ratioPerKg} × <span className="font-bold text-pink-600">{profile.weightKg}</span>
              <br />
              <span className="text-lg font-bold text-pink-700">= {targets.fats} g</span> ({(targets.fats * 9)} kcal from fats)
            </div>
          </div>

          <div className="bg-orange-50 p-5 rounded-lg border-l-4 border-orange-600 shadow-sm">
            <div className="font-bold text-lg mb-3 text-orange-900">7. Carbs (g) - Calculated & Capped:</div>
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
                    <span className="text-lg font-bold text-orange-700">= {targets.carbs} g</span> ({(targets.carbs * 4)} kcal from carbs)
                  </>
                );
              })()}
            </div>
          </div>

          <div className="bg-indigo-50 p-5 rounded-lg border-l-4 border-indigo-600 shadow-sm">
            <div className="font-bold text-lg mb-3 text-indigo-900">8. Macro-defined Calories:</div>
            <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
              Macro Total = {targets.proteinCalories} (protein) + {targets.fatCalories} (fats) + {targets.carbCalories} (carbs)
              <br />
              <span className="text-lg font-bold text-indigo-700">= {targets.recompCalories} kcal</span>
              <br />
              <span className="text-sm text-gray-600 mt-2 block">(Macro floor - actual intake will be higher due to cooking oil, variance, etc.)</span>
            </div>
          </div>

          <div className="bg-teal-50 p-5 rounded-lg border-l-4 border-teal-600 shadow-sm">
            <div className="font-bold text-lg mb-3 text-teal-900">9. Expected Real Intake Range:</div>
            <div className="font-mono text-base text-gray-800 bg-white p-3 rounded border">
              Expected Intake = {targets.recompCalories} (macro floor) + {recompConfig.recomp.intakeBufferMin}-{recompConfig.recomp.intakeBufferMax} (buffer)
              <br />
              <span className="text-lg font-bold text-teal-700">= {targets.recompCalories + recompConfig.recomp.intakeBufferMin} - {targets.recompCalories + recompConfig.recomp.intakeBufferMax} kcal</span>
              <br />
              <span className="text-sm text-gray-600 mt-2 block">(Accounts for cooking oil, sabzi, roti/fruit variance, etc.)</span>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-lg border-l-4 border-slate-600 shadow-sm">
            <div className="font-bold text-lg mb-3 text-slate-900">10. Effective Deficit:</div>
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
  );
}

