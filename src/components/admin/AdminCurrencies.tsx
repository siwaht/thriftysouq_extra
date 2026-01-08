import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, DollarSign, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  is_default: boolean;
  is_active: boolean;
  updated_at: string;
}

export function AdminCurrencies() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Currency>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Currency>>({
    code: '',
    name: '',
    symbol: '',
    exchange_rate: 1.0,
    is_default: false,
    is_active: true,
  });

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .order('code');

      if (error) throw error;
      setCurrencies(data || []);
    } catch (error) {
      console.error('Error loading currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      if (formData.is_default) {
        await supabase
          .from('currencies')
          .update({ is_default: false })
          .neq('id', '00000000-0000-0000-0000-000000000000');
      }

      const { error } = await supabase
        .from('currencies')
        .insert([formData]);

      if (error) throw error;

      await loadCurrencies();
      setShowAddForm(false);
      setFormData({
        code: '',
        name: '',
        symbol: '',
        exchange_rate: 1.0,
        is_default: false,
        is_active: true,
      });
    } catch (error) {
      console.error('Error adding currency:', error);
      alert('Error adding currency. Code might already exist.');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Currency>) => {
    try {
      if (updates.is_default) {
        await supabase
          .from('currencies')
          .update({ is_default: false })
          .neq('id', id);
      }

      const { error } = await supabase
        .from('currencies')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadCurrencies();
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error('Error updating currency:', error);
      alert('Error updating currency');
    }
  };

  const handleDelete = async (id: string) => {
    const currency = currencies.find(c => c.id === id);
    if (currency?.is_default) {
      alert('Cannot delete the default currency. Please set another currency as default first.');
      return;
    }

    if (!confirm('Are you sure you want to delete this currency?')) return;

    try {
      const { error } = await supabase
        .from('currencies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadCurrencies();
    } catch (error) {
      console.error('Error deleting currency:', error);
      alert('Error deleting currency');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const currency = currencies.find(c => c.id === id);
    if (currency?.is_default && currentStatus) {
      alert('Cannot deactivate the default currency.');
      return;
    }
    await handleUpdate(id, { is_active: !currentStatus });
  };

  const setAsDefault = async (id: string) => {
    await handleUpdate(id, { is_default: true, is_active: true });
  };

  const startEdit = (currency: Currency) => {
    setEditingId(currency.id);
    setEditData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      exchange_rate: currency.exchange_rate,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = (id: string) => {
    handleUpdate(id, editData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Currencies</h2>
          <p className="text-gray-600 mt-1">Manage supported currencies and exchange rates</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Currency
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Exchange Rates</h3>
            <p className="text-sm text-blue-800">
              Exchange rates are relative to your default currency. For example, if USD is default with rate 1.0,
              and EUR has rate 0.85, it means 1 USD = 0.85 EUR.
            </p>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Currency</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., EUR"
                maxLength={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., Euro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., €"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exchange Rate</label>
              <input
                type="number"
                step="0.0001"
                value={formData.exchange_rate}
                onChange={(e) => setFormData({ ...formData, exchange_rate: parseFloat(e.target.value) || 1.0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="1.0"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">Set as default currency</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add Currency
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Currency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exchange Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currencies.map((currency) => (
              <tr key={currency.id} className="hover:bg-gray-50">
                {editingId === currency.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editData.code}
                        onChange={(e) => setEditData({ ...editData, code: e.target.value.toUpperCase() })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        maxLength={3}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editData.symbol}
                        onChange={(e) => setEditData({ ...editData, symbol: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.0001"
                        value={editData.exchange_rate}
                        onChange={(e) => setEditData({ ...editData, exchange_rate: parseFloat(e.target.value) })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        currency.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {currency.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => saveEdit(currency.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{currency.name}</p>
                          {currency.is_default && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {currency.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium text-lg">
                      {currency.symbol}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {currency.exchange_rate.toFixed(4)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(currency.id, currency.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          currency.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {currency.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!currency.is_default && (
                          <button
                            onClick={() => setAsDefault(currency.id)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Set as default"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(currency)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!currency.is_default && (
                          <button
                            onClick={() => handleDelete(currency.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currencies.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No currencies found</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Add your first currency
          </button>
        </div>
      )}
    </div>
  );
}
