import { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, RefreshCw, ExternalLink, Code, CheckCircle, AlertCircle, Loader2, Copy, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EdgeFunction {
  id: string;
  slug: string;
  name: string;
  version: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export function AdminMCP() {
  const [functions, setFunctions] = useState<EdgeFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  useEffect(() => {
    loadFunctions();
  }, []);

  const loadFunctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const knownFunctions: EdgeFunction[] = [
        {
          id: '1',
          slug: 'stripe-payment',
          name: 'Stripe Payment',
          version: 1,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          slug: 'paypal-payment',
          name: 'PayPal Payment',
          version: 1,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setFunctions(knownFunctions);
    } catch (err) {
      setError('Failed to load edge functions');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getEndpointUrl = (slug: string) => {
    return `${supabaseUrl}/functions/v1/${slug}`;
  };

  const maskString = (str: string) => {
    if (!str) return '';
    if (str.length <= 8) return '********';
    return str.substring(0, 4) + '****' + str.substring(str.length - 4);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">MCP & Edge Functions</h1>
          <p className="text-gray-600 mt-1">Manage your Supabase edge functions and API configuration</p>
        </div>
        <button
          onClick={loadFunctions}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="font-medium">Refresh</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">API Configuration</h2>
              <p className="text-sm text-gray-500">Supabase connection details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Supabase URL</label>
                <button
                  onClick={() => copyToClipboard(supabaseUrl, 'url')}
                  className="text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {copiedKey === 'url' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm text-gray-700 break-all">
                {supabaseUrl || 'Not configured'}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Anon Key</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(supabaseAnonKey, 'anon')}
                    className="text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    {copiedKey === 'anon' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm text-gray-700 break-all">
                {showSecrets ? supabaseAnonKey : maskString(supabaseAnonKey)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-500">Common operations</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl border border-gray-200 hover:border-emerald-200 transition-all duration-200 group"
            >
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">Dashboard</span>
            </button>
            <button
              onClick={() => window.open(`${supabaseUrl}/functions/v1`, '_blank')}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl border border-gray-200 hover:border-emerald-200 transition-all duration-200 group"
            >
              <Code className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">Functions API</span>
            </button>
            <button
              onClick={loadFunctions}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl border border-gray-200 hover:border-emerald-200 transition-all duration-200 group"
            >
              <RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">Refresh</span>
            </button>
            <button
              onClick={() => window.open('https://supabase.com/docs/guides/functions', '_blank')}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl border border-gray-200 hover:border-emerald-200 transition-all duration-200 group"
            >
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">Docs</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edge Functions</h2>
              <p className="text-sm text-gray-500">{functions.length} deployed functions</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <button
              onClick={loadFunctions}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : functions.length === 0 ? (
          <div className="p-12 text-center">
            <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No edge functions deployed yet</p>
            <p className="text-sm text-gray-500">Deploy edge functions to extend your application</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {functions.map((func) => (
              <div key={func.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{func.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">{func.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      func.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {func.status}
                    </span>
                    <span className="text-sm text-gray-500">v{func.version}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Endpoint</label>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 font-mono overflow-x-auto">
                      {getEndpointUrl(func.slug)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(getEndpointUrl(func.slug), func.slug)}
                      className="p-2 text-gray-400 hover:text-emerald-600 transition-colors flex-shrink-0"
                    >
                      {copiedKey === func.slug ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6">
        <h3 className="font-semibold text-emerald-900 mb-3">Usage Example</h3>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
          <code>{`const response = await fetch(
  '${supabaseUrl}/functions/v1/stripe-payment',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: 1000 }),
  }
);`}</code>
        </pre>
      </div>
    </div>
  );
}
