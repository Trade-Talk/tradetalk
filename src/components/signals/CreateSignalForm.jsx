import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';

export default function CreateSignalForm({ onClose, onSubmit, advisorId }) {
  const [formData, setFormData] = useState({
    direction: 'LONG',
    symbol: '',
    exchange: 'NSE',
    entry_min: '',
    entry_max: '',
    current_price: '',
    targets: ['', ''],
    stop_loss: '',
    rationale: '',
    timeframe: 'INTRADAY',
    risk_level: 'MEDIUM'
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.symbol) newErrors.symbol = 'Symbol is required';
    if (!formData.entry_min) newErrors.entry_min = 'Entry min is required';
    if (!formData.entry_max) newErrors.entry_max = 'Entry max is required';
    if (!formData.stop_loss) newErrors.stop_loss = 'Stop loss is required';
    if (!formData.targets[0]) newErrors.target1 = 'At least one target is required';
    if (!formData.rationale) newErrors.rationale = 'Rationale is required';

    // Validate entry range
    if (formData.entry_min && formData.entry_max) {
      if (parseFloat(formData.entry_min) >= parseFloat(formData.entry_max)) {
        newErrors.entry_max = 'Entry max must be greater than entry min';
      }
    }

    // Validate stop loss position
    if (formData.direction === 'LONG') {
      if (parseFloat(formData.stop_loss) >= parseFloat(formData.entry_min)) {
        newErrors.stop_loss = 'Stop loss must be below entry for LONG';
      }
      if (formData.targets[0] && parseFloat(formData.targets[0]) <= parseFloat(formData.entry_max)) {
        newErrors.target1 = 'Target must be above entry for LONG';
      }
    } else {
      if (parseFloat(formData.stop_loss) <= parseFloat(formData.entry_max)) {
        newErrors.stop_loss = 'Stop loss must be above entry for SHORT';
      }
      if (formData.targets[0] && parseFloat(formData.targets[0]) >= parseFloat(formData.entry_min)) {
        newErrors.target1 = 'Target must be below entry for SHORT';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    const signalData = {
      ...formData,
      targets: formData.targets.filter(t => t !== '').map(t => parseFloat(t)),
      entry_min: parseFloat(formData.entry_min),
      entry_max: parseFloat(formData.entry_max),
      stop_loss: parseFloat(formData.stop_loss),
      current_price: parseFloat(formData.current_price || formData.entry_min),
      advisor_id: advisorId,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    onSubmit(signalData);
  };

  const addTarget = () => {
    if (formData.targets.length < 3) {
      setFormData({ ...formData, targets: [...formData.targets, ''] });
    }
  };

  const removeTarget = (index) => {
    if (formData.targets.length > 1) {
      const newTargets = formData.targets.filter((_, i) => i !== index);
      setFormData({ ...formData, targets: newTargets });
    }
  };

  const updateTarget = (index, value) => {
    const newTargets = [...formData.targets];
    newTargets[index] = value;
    setFormData({ ...formData, targets: newTargets });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create Smart Signal</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Direction Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Direction *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, direction: 'LONG' })}
                className={`p-4 rounded-xl border-2 font-semibold flex items-center justify-center gap-2 transition-all ${
                  formData.direction === 'LONG'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <TrendingUp size={20} />
                LONG (BUY)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, direction: 'SHORT' })}
                className={`p-4 rounded-xl border-2 font-semibold flex items-center justify-center gap-2 transition-all ${
                  formData.direction === 'SHORT'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <TrendingDown size={20} />
                SHORT (SELL)
              </button>
            </div>
          </div>

          {/* Symbol & Exchange */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symbol * <span className="text-xs text-gray-500">(e.g., RELIANCE)</span>
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.symbol ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="RELIANCE"
              />
              {errors.symbol && <p className="text-red-500 text-xs mt-1">{errors.symbol}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exchange *
              </label>
              <select
                value={formData.exchange}
                onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
                <option value="MCX">MCX</option>
              </select>
            </div>
          </div>

          {/* Entry Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entry Zone * <span className="text-xs text-gray-500">(Price range to enter)</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.entry_min}
                  onChange={(e) => setFormData({ ...formData, entry_min: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.entry_min ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Min ₹"
                />
                {errors.entry_min && <p className="text-red-500 text-xs mt-1">{errors.entry_min}</p>}
              </div>
              <div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.entry_max}
                  onChange={(e) => setFormData({ ...formData, entry_max: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.entry_max ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Max ₹"
                />
                {errors.entry_max && <p className="text-red-500 text-xs mt-1">{errors.entry_max}</p>}
              </div>
            </div>
          </div>

          {/* Targets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Targets * <span className="text-xs text-gray-500">(Up to 3 targets)</span>
              </label>
              {formData.targets.length < 3 && (
                <button
                  type="button"
                  onClick={addTarget}
                  className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:text-blue-700"
                >
                  <Plus size={16} />
                  Add Target
                </button>
              )}
            </div>
            <div className="space-y-3">
              {formData.targets.map((target, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      value={target}
                      onChange={(e) => updateTarget(index, e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[`target${index + 1}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={`Target ${index + 1} ₹`}
                    />
                    {errors[`target${index + 1}`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`target${index + 1}`]}</p>
                    )}
                  </div>
                  {formData.targets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTarget(index)}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stop Loss */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stop Loss * <span className="text-xs text-gray-500">(Exit if price hits this)</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.stop_loss}
              onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.stop_loss ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Stop Loss ₹"
            />
            {errors.stop_loss && <p className="text-red-500 text-xs mt-1">{errors.stop_loss}</p>}
          </div>

          {/* Timeframe & Risk */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeframe *
              </label>
              <select
                value={formData.timeframe}
                onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="INTRADAY">Intraday</option>
                <option value="SWING">Swing (1-7 days)</option>
                <option value="POSITIONAL">Positional (1-4 weeks)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Level *
              </label>
              <select
                value={formData.risk_level}
                onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Rationale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rationale * <span className="text-xs text-gray-500">(Why this trade?)</span>
            </label>
            <textarea
              value={formData.rationale}
              onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
              rows={4}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.rationale ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Explain your analysis: chart patterns, indicators, fundamentals, news, etc."
            />
            {errors.rationale && <p className="text-red-500 text-xs mt-1">{errors.rationale}</p>}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Post Signal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
