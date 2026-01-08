import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount: number;
  usage_limit: number;
  usage_count: number;
  customer_usage_limit: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_purchase_amount: 0,
    max_discount_amount: 0,
    usage_limit: 0,
    usage_count: 0,
    customer_usage_limit: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('coupons')
        .insert([{ ...formData, code: formData.code?.toUpperCase() }]);

      if (error) throw error;

      await loadCoupons();
      setShowAddForm(false);
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_purchase_amount: 0,
        max_discount_amount: 0,
        usage_limit: 0,
        usage_count: 0,
        customer_usage_limit: 1,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true,
      });
    } catch (error) {
      console.error('Error adding coupon:', error);
      alert('Error adding coupon. Code might already exist.');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Coupon>) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadCoupons();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert('Error updating coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Error deleting coupon');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await handleUpdate(id, { is_active: !currentStatus });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
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
          <h2 className="text-2xl font-bold text-gray-900">Coupons & Discounts</h2>
          <p className="text-gray-600 mt-1">Manage promotional codes and special offers</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Coupon</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., SUMMER2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
              <input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Purchase Amount ($)</label>
              <input
                type="number"
                value={formData.min_purchase_amount}
                onChange={(e) => setFormData({ ...formData, min_purchase_amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount Amount ($)</label>
              <input
                type="number"
                value={formData.max_discount_amount}
                onChange={(e) => setFormData({ ...formData, max_discount_amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0 (unlimited)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Usage Limit</label>
              <input
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0 (unlimited)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={2}
                placeholder="e.g., Summer sale - 10% off all items"
              />
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
              Create Coupon
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`bg-white rounded-lg shadow-md p-6 ${
              isExpired(coupon.end_date) ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Tag className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{coupon.code}</h3>
                    <p className="text-sm text-gray-600">{coupon.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Discount</p>
                    <p className="font-semibold text-gray-900">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : `$${coupon.discount_value.toFixed(2)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Usage</p>
                    <p className="font-semibold text-gray-900">
                      {coupon.usage_count} / {coupon.usage_limit || '∞'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Valid Period</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatDate(coupon.start_date)} - {formatDate(coupon.end_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <button
                      onClick={() => toggleActive(coupon.id, coupon.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        coupon.is_active && !isExpired(coupon.end_date)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {isExpired(coupon.end_date) ? 'Expired' : coupon.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                {coupon.min_purchase_amount > 0 && (
                  <p className="text-xs text-gray-600 mt-3">
                    Min purchase: ${coupon.min_purchase_amount.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No coupons found</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Create your first coupon
          </button>
        </div>
      )}
    </div>
  );
}
