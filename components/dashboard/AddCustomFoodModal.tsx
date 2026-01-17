'use client';

import { useState } from 'react';
import { addCustomFood } from '@/lib/actions/foods';

interface AddCustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onFoodAdded: (foodId: string, foodName: string) => void;
}

export default function AddCustomFoodModal({ isOpen, onClose, userId, onFoodAdded }: AddCustomFoodModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    unit: 'g' as 'g' | 'piece' | 'tsp' | 'tbsp' | 'slice',
    // Per-100g values
    caloriesPer100g: '',
    proteinPer100g: '',
    carbsPer100g: '',
    fatsPer100g: '',
    // Per-piece values
    unitSize: '',
    caloriesPerPiece: '',
    proteinPerPiece: '',
    carbsPerPiece: '',
    fatsPerPiece: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usePerPiece, setUsePerPiece] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (usePerPiece) {
        // Validate per-piece values
        if (!formData.name || !formData.caloriesPerPiece || !formData.proteinPerPiece) {
          setError('Please fill in name, calories per piece, and protein per piece');
          setLoading(false);
          return;
        }

        const result = await addCustomFood(userId, {
          name: formData.name,
          unit: formData.unit,
          caloriesPerPiece: parseFloat(formData.caloriesPerPiece),
          proteinPerPiece: parseFloat(formData.proteinPerPiece),
          carbsPerPiece: parseFloat(formData.carbsPerPiece) || 0,
          fatsPerPiece: parseFloat(formData.fatsPerPiece) || 0,
          notes: formData.notes || undefined,
        });

        if (result.success) {
          onFoodAdded(result.foodId || '', result.foodName || formData.name);
          // Reset form
          setFormData({
            name: '',
            unit: 'g',
            caloriesPer100g: '',
            proteinPer100g: '',
            carbsPer100g: '',
            fatsPer100g: '',
            unitSize: '',
            caloriesPerPiece: '',
            proteinPerPiece: '',
            carbsPerPiece: '',
            fatsPerPiece: '',
            notes: '',
          });
          setUsePerPiece(false);
          onClose();
        } else {
          setError(result.error || 'Failed to add food');
        }
      } else {
        // Validate per-100g values
        if (!formData.name || !formData.caloriesPer100g || !formData.proteinPer100g) {
          setError('Please fill in name, calories per 100g, and protein per 100g');
          setLoading(false);
          return;
        }

        const result = await addCustomFood(userId, {
          name: formData.name,
          unit: formData.unit,
          caloriesPer100g: parseFloat(formData.caloriesPer100g),
          proteinPer100g: parseFloat(formData.proteinPer100g),
          carbsPer100g: parseFloat(formData.carbsPer100g) || 0,
          fatsPer100g: parseFloat(formData.fatsPer100g) || 0,
          unitSize: formData.unitSize ? parseFloat(formData.unitSize) : undefined,
          notes: formData.notes || undefined,
        });

        if (result.success) {
          onFoodAdded(result.foodId || '', result.foodName || formData.name);
          // Reset form
          setFormData({
            name: '',
            unit: 'g',
            caloriesPer100g: '',
            proteinPer100g: '',
            carbsPer100g: '',
            fatsPer100g: '',
            unitSize: '',
            caloriesPerPiece: '',
            proteinPerPiece: '',
            carbsPerPiece: '',
            fatsPerPiece: '',
            notes: '',
          });
          setUsePerPiece(false);
          onClose();
        } else {
          setError(result.error || 'Failed to add food');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">➕ Add Custom Food</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="e.g., My Protein Bar"
              />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!usePerPiece}
                  onChange={() => setUsePerPiece(false)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Per 100g (for gram-based foods)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={usePerPiece}
                  onChange={() => setUsePerPiece(true)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Per Piece (for eggs, cookies, etc.)</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="g">g (grams)</option>
                <option value="piece">piece</option>
                <option value="tsp">tsp (teaspoon)</option>
                <option value="tbsp">tbsp (tablespoon)</option>
                <option value="slice">slice</option>
              </select>
            </div>

            {usePerPiece ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calories per piece *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.caloriesPerPiece}
                      onChange={(e) => setFormData({ ...formData, caloriesPerPiece: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Protein per piece (g) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.proteinPerPiece}
                      onChange={(e) => setFormData({ ...formData, proteinPerPiece: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carbs per piece (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.carbsPerPiece}
                      onChange={(e) => setFormData({ ...formData, carbsPerPiece: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fats per piece (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.fatsPerPiece}
                      onChange={(e) => setFormData({ ...formData, fatsPerPiece: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calories per 100g *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.caloriesPer100g}
                      onChange={(e) => setFormData({ ...formData, caloriesPer100g: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Protein per 100g (g) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.proteinPer100g}
                      onChange={(e) => setFormData({ ...formData, proteinPer100g: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carbs per 100g (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.carbsPer100g}
                      onChange={(e) => setFormData({ ...formData, carbsPer100g: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fats per 100g (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.fatsPer100g}
                      onChange={(e) => setFormData({ ...formData, fatsPer100g: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>
                {formData.unit !== 'g' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Size (grams per {formData.unit})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.unitSize}
                      onChange={(e) => setFormData({ ...formData, unitSize: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="e.g., 5 for tsp, 15 for tbsp"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="e.g., Brand name, cooking method"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium"
              >
                {loading ? 'Adding...' : 'Add Food'}
              </button>
              <button
                type="button"
                onClick={onClose}
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

