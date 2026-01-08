import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Play, Pause, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret_key: string;
  is_active: boolean;
  headers: Record<string, string>;
  created_at: string;
}

interface WebhookLog {
  id: string;
  event_type: string;
  response_status: number | null;
  retry_count: number;
  created_at: string;
}

const EVENT_TYPES = [
  'order.created',
  'order.updated',
  'order.completed',
  'order.cancelled',
  'payment.completed',
  'payment.failed',
  'product.created',
  'product.updated',
  'product.deleted',
  'customer.created',
  'review.created',
];

export function AdminWebhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [, setSelectedWebhook] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    url: '',
    events: [] as string[],
    secret_key: '',
    is_active: true,
    headers: {} as Record<string, string>,
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWebhooks(data);
    }
  };

  const fetchLogs = async (webhookId: string) => {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setLogs(data);
    }
  };

  const generateSecretKey = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const webhookData = {
      name: formData.name,
      url: formData.url,
      events: formData.events,
      secret_key: formData.secret_key || generateSecretKey(),
      is_active: formData.is_active,
      headers: formData.headers,
    };

    if (formData.id) {
      await supabase
        .from('webhooks')
        .update(webhookData)
        .eq('id', formData.id);
    } else {
      await supabase.from('webhooks').insert([webhookData]);
    }

    setIsModalOpen(false);
    resetForm();
    fetchWebhooks();
  };

  const handleEdit = (webhook: Webhook) => {
    setFormData({
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret_key: webhook.secret_key,
      is_active: webhook.is_active,
      headers: webhook.headers,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      await supabase.from('webhooks').delete().eq('id', id);
      fetchWebhooks();
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('webhooks')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    fetchWebhooks();
  };

  const testWebhook = async (webhook: Webhook) => {
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook' },
    };

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhook.secret_key,
          ...webhook.headers,
        },
        body: JSON.stringify(testPayload),
      });

      await supabase.from('webhook_logs').insert([{
        webhook_id: webhook.id,
        event_type: 'webhook.test',
        payload: testPayload,
        response_status: response.status,
        response_body: await response.text(),
        delivered_at: new Date().toISOString(),
      }]);

      alert(`Webhook test ${response.ok ? 'successful' : 'failed'}: ${response.status}`);
    } catch (error) {
      alert('Failed to send test webhook: ' + (error as Error).message);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      url: '',
      events: [],
      secret_key: '',
      is_active: true,
      headers: {},
    });
  };

  const viewLogs = (webhookId: string) => {
    setSelectedWebhook(webhookId);
    fetchLogs(webhookId);
    setIsLogsOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-gray-600 mt-1">Manage webhook endpoints for external integrations</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Webhook
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {webhooks.map((webhook) => (
              <tr key={webhook.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{webhook.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{webhook.url}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{webhook.events.length} events</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    webhook.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {webhook.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(webhook.id, webhook.is_active)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title={webhook.is_active ? 'Pause' : 'Activate'}
                    >
                      {webhook.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => testWebhook(webhook)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Test webhook"
                    >
                      <Play className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => viewLogs(webhook.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="View logs"
                    >
                      <Activity className="w-4 h-4 text-purple-600" />
                    </button>
                    <button
                      onClick={() => handleEdit(webhook)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(webhook.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {webhooks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No webhooks configured. Add your first webhook to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{formData.id ? 'Edit' : 'Add'} Webhook</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/webhook"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subscribe to Events</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {EVENT_TYPES.map((event) => (
                    <label key={event} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, events: [...formData.events, event] });
                          } else {
                            setFormData({ ...formData, events: formData.events.filter(e => e !== event) });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.secret_key}
                    onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    placeholder="Auto-generated if left empty"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, secret_key: generateSecretKey() })}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Use this key to verify webhook signatures</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {formData.id ? 'Update' : 'Create'} Webhook
                </button>
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLogsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Webhook Logs</h2>
              <button
                onClick={() => setIsLogsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-gray-900">{log.event_type}</span>
                      <span className="text-sm text-gray-500 ml-3">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.response_status && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          log.response_status >= 200 && log.response_status < 300
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.response_status}
                        </span>
                      )}
                      {log.retry_count > 0 && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Retries: {log.retry_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center py-8 text-gray-500">No logs available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
