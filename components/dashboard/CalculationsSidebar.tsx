'use client';

import { useState } from 'react';
import { recompConfig } from '@/lib/config';

interface CalculationsSidebarProps {
  profile: any;
  targets: any;
}

export default function CalculationsSidebar({ profile, targets }: CalculationsSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-8 rounded-r-lg shadow-lg hover:bg-blue-700 transition-all z-50"
        aria-label={isOpen ? 'Close calculations' : 'Show calculations'}
      >
        <span className="text-2xl">{isOpen ? '‹' : '›'}</span>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-96 bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📊 Recomp Calculations</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
              <div className="font-bold text-sm mb-2 text-blue-900">1. BMR - Mifflin-St Jeor:</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded border">
                {profile.gender === 'male' ? (
                  <>BMR = 10 × {profile.weightKg} + 6.25 × {profile.heightCm} - 5 × {profile.age} + 5</>
                ) : (
                  <>BMR = 10 × {profile.weightKg} + 6.25 × {profile.heightCm} - 5 × {profile.age} - 161</>
                )}
                <br />
                <span className="text-sm font-bold text-blue-700">= {targets.bmr} kcal</span>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
              <div className="font-bold text-sm mb-2 text-green-900">2. Activity Multiplier:</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded border">
                Activity = <span className="font-bold">{recompConfig.activity.multiplier}</span> (fixed)
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
              <div className="font-bold text-sm mb-2 text-green-900">3. Maintenance:</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded border">
                Maintenance = {targets.bmr} × {recompConfig.activity.multiplier}
                <br />
                <span className="text-sm font-bold text-green-700">= {targets.maintenance} kcal</span>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
              <div className="font-bold text-sm mb-2 text-purple-900">4. Upper Bound:</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded border">
                Upper Bound = {targets.maintenance} - {recompConfig.recomp.subtractValue}
                <br />
                <span className="text-sm font-bold text-purple-700">= {targets.maintenance - recompConfig.recomp.subtractValue} kcal</span>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-600">
              <div className="font-bold text-sm mb-2 text-yellow-900">5. Protein:</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded border">
                Protein = {recompConfig.protein.ratioPerKg} × {profile.weightKg}
                <br />
                <span className="text-sm font-bold text-yellow-700">= {targets.protein} g</span> ({(targets.protein * 4)} kcal)
              </div>
            </div>

            <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-600">
              <div className="font-bold text-sm mb-2 text-pink-900">6. Fats:</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded border">
                Fats = {recompConfig.fat.ratioPerKg} × {profile.weightKg}
                <br />
                <span className="text-sm font-bold text-pink-700">= {targets.fats} g</span> ({(targets.fats * 9)} kcal)
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
              <div className="font-bold text-sm mb-2 text-orange-900">7. Carbs:</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded border">
                {(() => {
                  const targetRecomp = targets.maintenance - recompConfig.recomp.subtractValue;
                  const remainingCalories = targetRecomp - targets.proteinCalories - targets.fatCalories;
                  const calculatedCarbs = Math.round(remainingCalories / 4);
                  return (
                    <>
                      Remaining = {targetRecomp} - {targets.proteinCalories} - {targets.fatCalories} = {remainingCalories}
                      <br />
                      Calculated = {remainingCalories} ÷ 4 = {calculatedCarbs}g
                      <br />
                      Capped = min({calculatedCarbs}, {recompConfig.carbs.max})
                      <br />
                      <span className="text-sm font-bold text-orange-700">= {targets.carbs} g</span> ({(targets.carbs * 4)} kcal)
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-600">
              <div className="font-bold text-sm mb-2 text-indigo-900">8. Macro-defined Calories:</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded border">
                Total = {targets.proteinCalories} + {targets.fatCalories} + {targets.carbCalories}
                <br />
                <span className="text-sm font-bold text-indigo-700">= {targets.recompCalories} kcal</span>
              </div>
            </div>

            <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-600">
              <div className="font-bold text-sm mb-2 text-teal-900">9. Expected Intake:</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded border">
                Expected = {targets.recompCalories} + {recompConfig.recomp.intakeBufferMin}-{recompConfig.recomp.intakeBufferMax}
                <br />
                <span className="text-sm font-bold text-teal-700">= {targets.recompCalories + recompConfig.recomp.intakeBufferMin} - {targets.recompCalories + recompConfig.recomp.intakeBufferMax} kcal</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-600">
              <div className="font-bold text-sm mb-2 text-slate-900">10. Effective Deficit:</div>
              <div className="font-mono text-xs text-gray-800 bg-white p-2 rounded border">
                {(() => {
                  const expectedIntake = Math.round((targets.recompCalories + recompConfig.recomp.intakeBufferMin + targets.recompCalories + recompConfig.recomp.intakeBufferMax) / 2);
                  const effectiveDeficit = targets.maintenance - expectedIntake;
                  const effectiveDeficitPercent = Math.round((effectiveDeficit / targets.maintenance) * 100 * 100) / 100;
                  return (
                    <>
                      Deficit = {targets.maintenance} - {expectedIntake}
                      <br />
                      <span className="text-sm font-bold text-slate-700">= {effectiveDeficit} kcal ({effectiveDeficitPercent}%)</span>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[55]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

