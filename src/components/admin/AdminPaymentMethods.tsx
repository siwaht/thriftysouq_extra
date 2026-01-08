import { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard, Banknote, Wallet, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  config: Record<string, unknown>;
}

const iconMap: Record<string, React.ReactNode> = {
  'credit-card': <CreditCard className="w-5 h-5" />,
  'banknote': <Banknote className="w-5 h-5" />,
  'wallet': <Wallet className="w-5 h-5" />,
  'building-2': <Building2 className="w-5 h-5" />,
};

export function AdminPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    name: '',
    code: '',
    description: '',
    icon: 'credit-card',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert([formData]);

      if (error) throw error;

      await loadPaymentMethods();
      setShowAddForm(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        icon: 'credit-card',
        is_active: true,
        sort_order: 0,
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      alert('Error adding payment method');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<PaymentMethod>) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadPaymentMethods();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating payment method:', error);
      alert('Error updating payment method');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('Error deleting payment method');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await handleUpdate(id, { is_active: !currentStatus });
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
        <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Payment Method
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Payment Method</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., Cash on Delivery"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., cod"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={2}
                placeholder="e.g., Pay with cash when your order is delivered"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="credit-card">Credit Card</option>
                <option value="banknote">Banknote</option>
                <option value="wallet">Wallet</option>
                <option value="building-2">Building</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData({
                  name: '',
                  code: '',
                  description: '',
                  icon: 'credit-card',
                  is_active: true,
                  sort_order: 0,
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add Payment Method
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paymentMethods.map((method) => (
              <tr key={method.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-600">
                      {iconMap[method.icon] || iconMap['credit-card']}
                    </div>
                    <span className="font-medium text-gray-900">{method.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <code className="bg-gray-100 px-2 py-1 rounded">{method.code}</code>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {method.description}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(method.id, method.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      method.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {method.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {method.sort_order}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paymentMethods.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No payment methods found</p>
        </div>
      )}
    </div>
  );
}
