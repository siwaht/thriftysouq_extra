import { useState, useEffect } from 'react';
import { Save, Key, Store, Mail, DollarSign, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StoreSettings {
  id: string;
  store_name: string;
  store_description: string;
  contact_email: string;
  contact_phone: string;
  logo_url: string;
  tax_rate: number;
  default_currency: string;
  timezone: string;
}

interface ApiKey {
  id: string;
  name: string;
  provider: string;
  key_public: string;
  key_secret: string;
  environment: string;
  is_active: boolean;
}

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'api'>('general');
  const [settings, setSettings] = useState<StoreSettings>({
    id: '',
    store_name: '',
    store_description: '',
    contact_email: '',
    contact_phone: '',
    logo_url: '',
    tax_rate: 0,
    default_currency: 'USD',
    timezone: 'UTC',
  });
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKey, setNewKey] = useState({
    name: '',
    provider: 'stripe',
    key_public: '',
    key_secret: '',
    environment: 'test',
    is_active: true,
  });

  useEffect(() => {
    fetchSettings();
    fetchApiKeys();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('store_settings')
      .select('*')
      .maybeSingle();

    if (data) {
      setSettings(data);
    }
  };

  const fetchApiKeys = async () => {
    const { data } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setApiKeys(data);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      if (settings.id) {
        await supabase
          .from('store_settings')
          .update({
            store_name: settings.store_name,
            store_description: settings.store_description,
            contact_email: settings.contact_email,
            contact_phone: settings.contact_phone,
            logo_url: settings.logo_url,
            tax_rate: settings.tax_rate,
            default_currency: settings.default_currency,
            timezone: settings.timezone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id);
      } else {
        const { data } = await supabase
          .from('store_settings')
          .insert([settings])
          .select()
          .single();
        if (data) {
          setSettings(data);
        }
      }
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddApiKey = async () => {
    try {
      await supabase.from('api_keys').insert([newKey]);
      setIsAddingKey(false);
      setNewKey({
        name: '',
        provider: 'stripe',
        key_public: '',
        key_secret: '',
        environment: 'test',
        is_active: true,
      });
      fetchApiKeys();
      alert('API key added successfully!');
    } catch (error) {
      alert('Failed to add API key: ' + (error as Error).message);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      await supabase.from('api_keys').delete().eq('id', id);
      fetchApiKeys();
    }
  };

  const toggleApiKey = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('api_keys')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    fetchApiKeys();
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your store and integrations</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'general'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Store className="w-4 h-4 inline mr-2" />
          General
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'payment'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Payment Settings
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'api'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Key className="w-4 h-4 inline mr-2" />
          API Keys
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl">
          <h2 className="text-xl font-bold mb-6">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
              <textarea
                value={settings.store_description || ''}
                onChange={(e) => setSettings({ ...settings, store_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="url"
                value={settings.logo_url || ''}
                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contact_email || ''}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={settings.contact_phone || ''}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                <select
                  value={settings.default_currency}
                  onChange={(e) => setSettings({ ...settings, default_currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.tax_rate}
                  onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl">
          <h2 className="text-xl font-bold mb-6">Payment Settings</h2>
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Default Tax Rate</h3>
              <p className="text-sm text-gray-600 mb-3">This will be applied to all orders unless overridden by region-specific rates.</p>
              <input
                type="number"
                step="0.01"
                value={settings.tax_rate}
                onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) })}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md"
              />
              <span className="ml-2 text-gray-600">%</span>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Payment Gateways</h3>
              <p className="text-sm text-gray-600 mb-3">Configure payment gateways in the API Keys tab.</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked readOnly className="rounded" />
                  <label className="text-sm">Stripe</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked readOnly className="rounded" />
                  <label className="text-sm">PayPal</label>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">API Keys</h2>
            <button
              onClick={() => setIsAddingKey(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add API Key
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Environment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Public Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{key.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{key.provider}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        key.environment === 'production' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {key.environment}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{maskKey(key.key_public)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        key.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleApiKey(key.id, key.is_active)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {key.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeleteApiKey(key.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {apiKeys.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No API keys configured. Add your first API key to enable payment processing.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {isAddingKey && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6">Add API Key</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={newKey.name}
                      onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="My Stripe Key"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                    <select
                      value={newKey.provider}
                      onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                    <select
                      value={newKey.environment}
                      onChange={(e) => setNewKey({ ...newKey, environment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="test">Test</option>
                      <option value="production">Production</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Public Key</label>
                    <input
                      type="text"
                      value={newKey.key_public}
                      onChange={(e) => setNewKey({ ...newKey, key_public: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                    <input
                      type="password"
                      value={newKey.key_secret}
                      onChange={(e) => setNewKey({ ...newKey, key_secret: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleAddApiKey}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Key
                    </button>
                    <button
                      onClick={() => setIsAddingKey(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
