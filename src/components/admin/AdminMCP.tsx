import { useState } from 'react';
import { ExternalLink, Code, CheckCircle, Loader2, Copy, Eye, EyeOff, Bot, Terminal, BookOpen, Play } from 'lucide-react';

interface ApiEndpoint {
  resource: string;
  actions: string[];
  description: string;
}

export function AdminMCP() {
  const [showSecrets, setShowSecrets] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'examples' | 'test'>('overview');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const apiEndpoint = `${supabaseUrl}/functions/v1/site-management`;

  const endpoints: ApiEndpoint[] = [
    { resource: 'dashboard', actions: ['get'], description: 'Get site statistics and metrics' },
    { resource: 'products', actions: ['list', 'get', 'create', 'update', 'delete'], description: 'Manage store products' },
    { resource: 'categories', actions: ['list', 'create', 'update', 'delete'], description: 'Manage product categories' },
    { resource: 'orders', actions: ['list', 'get', 'update_status'], description: 'View and manage customer orders' },
    { resource: 'reviews', actions: ['list', 'approve', 'reject', 'delete'], description: 'Moderate product reviews' },
    { resource: 'coupons', actions: ['list', 'create', 'update', 'delete'], description: 'Manage discount coupons' },
    { resource: 'currencies', actions: ['list', 'create', 'update', 'delete'], description: 'Configure supported currencies' },
    { resource: 'hero_settings', actions: ['get', 'update'], description: 'Update homepage hero banner' },
    { resource: 'footer_sections', actions: ['list', 'create', 'update', 'delete'], description: 'Manage footer sections' },
    { resource: 'footer_links', actions: ['list', 'create', 'update', 'delete'], description: 'Manage footer links' },
    { resource: 'settings', actions: ['get', 'update'], description: 'Update site-wide settings' },
    { resource: 'webhooks', actions: ['list', 'create', 'update', 'delete'], description: 'Configure webhook integrations' },
    { resource: 'payment_methods', actions: ['list', 'update'], description: 'Configure payment providers' },
  ];

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskString = (str: string) => {
    if (!str) return '';
    if (str.length <= 8) return '********';
    return str.substring(0, 4) + '****' + str.substring(str.length - 4);
  };

  const testApi = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resource: 'dashboard', action: 'get' }),
      });
      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestLoading(false);
    }
  };

  const mcpConfig = `{
  "mcpServers": {
    "thriftysouq": {
      "command": "node",
      "args": ["mcp-server/index.js"],
      "env": {
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_SERVICE_KEY": "your-service-key"
      }
    }
  }
}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Agent Control Center</h1>
          <p className="text-gray-600 mt-1">Control your entire site programmatically with AI agents</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
            MCP Ready
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">MCP Server for AI Agents</h2>
            <p className="text-emerald-100 mb-4">
              Full programmatic control over your e-commerce site via Model Context Protocol. 
              Connect Claude, GPT, or any MCP-compatible AI agent to manage products, orders, content, and settings.
            </p>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 mb-3">
              <code className="text-sm flex-1 overflow-x-auto">node mcp-server/index.js</code>
              <button
                onClick={() => copyToClipboard('node mcp-server/index.js', 'cmd')}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {copiedKey === 'cmd' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <code className="text-sm flex-1 overflow-x-auto">{apiEndpoint}</code>
              <button
                onClick={() => copyToClipboard(apiEndpoint, 'endpoint')}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {copiedKey === 'endpoint' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'endpoints', label: 'Endpoints', icon: Code },
              { id: 'examples', label: 'Examples', icon: Terminal },
              { id: 'test', label: 'Test API', icon: Play },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">API Credentials</h3>
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
                        <label className="text-sm font-medium text-gray-700">API Key</label>
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

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">MCP Configuration</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Add this to your <code className="bg-gray-100 px-1 rounded">.kiro/settings/mcp.json</code>:
                  </p>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-xs max-h-64">
                      <code>{mcpConfig}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(mcpConfig, 'mcp-config')}
                      className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {copiedKey === 'mcp-config' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="font-medium text-amber-800 mb-2">Quick Start</h4>
                <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                  <li>Copy the API endpoint and credentials above</li>
                  <li>Add the MCP tool definition to your AI agent</li>
                  <li>Make POST requests with resource, action, and optional data/id</li>
                  <li>Your AI can now fully manage the site!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                All endpoints accept POST requests to <code className="bg-gray-100 px-2 py-1 rounded">{apiEndpoint}</code>
              </p>
              <div className="grid gap-4">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.resource} className="border border-gray-200 rounded-xl p-4 hover:border-emerald-200 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{endpoint.resource}</h4>
                        <p className="text-sm text-gray-600 mt-1">{endpoint.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {endpoint.actions.map((action) => (
                        <span
                          key={action}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            action === 'delete' ? 'bg-red-100 text-red-700' :
                            action === 'create' ? 'bg-green-100 text-green-700' :
                            action === 'update' || action === 'update_status' ? 'bg-blue-100 text-blue-700' :
                            action === 'approve' ? 'bg-emerald-100 text-emerald-700' :
                            action === 'reject' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">List all products</h4>
                <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
                  <code>{`fetch('${apiEndpoint}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resource: 'products',
    action: 'list'
  })
})`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Create a new product</h4>
                <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
                  <code>{`fetch('${apiEndpoint}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resource: 'products',
    action: 'create',
    data: {
      name: 'New Product',
      description: 'Product description',
      price: 29.99,
      stock_quantity: 100,
      category_id: 'category-uuid'
    }
  })
})`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Update order status</h4>
                <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
                  <code>{`fetch('${apiEndpoint}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resource: 'orders',
    action: 'update_status',
    id: 'order-uuid',
    data: { status: 'shipped' }
  })
})`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Update hero banner</h4>
                <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
                  <code>{`fetch('${apiEndpoint}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resource: 'hero_settings',
    action: 'update',
    data: {
      title: 'Summer Sale!',
      subtitle: 'Up to 50% off selected items',
      button_text: 'Shop Now',
      background_image: 'https://...'
    }
  })
})`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Get dashboard stats</h4>
                <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
                  <code>{`fetch('${apiEndpoint}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resource: 'dashboard',
    action: 'get'
  })
})`}</code>
                </pre>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h4 className="font-medium text-emerald-800 mb-2">AI Agent Prompt Example</h4>
                <p className="text-sm text-emerald-700 mb-3">
                  Here's how an AI agent might use this API:
                </p>
                <pre className="bg-white rounded-lg p-4 text-sm text-gray-800 overflow-x-auto">
                  <code>{`User: "Create a 20% off coupon for the summer sale"

AI Agent Action:
{
  "tool": "manage_thriftysouq",
  "parameters": {
    "resource": "coupons",
    "action": "create",
    "data": {
      "code": "SUMMER20",
      "discount_type": "percentage",
      "discount_value": 20,
      "is_active": true,
      "expires_at": "2024-09-01T00:00:00Z"
    }
  }
}`}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Test API Connection</h4>
                <p className="text-gray-600 mb-4">
                  Click the button below to test the API by fetching dashboard statistics.
                </p>
                <button
                  onClick={testApi}
                  disabled={testLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {testLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  {testLoading ? 'Testing...' : 'Test Dashboard Endpoint'}
                </button>
              </div>

              {testResult && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Response</h4>
                  <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm max-h-96">
                    <code>{testResult}</code>
                  </pre>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-medium text-blue-800 mb-2">Interactive Testing</h4>
                <p className="text-sm text-blue-700">
                  For more advanced testing, use tools like Postman, Insomnia, or curl to make
                  requests to the API with different resources and actions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <ExternalLink className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Supabase Dashboard</p>
            <p className="text-sm text-gray-600">Manage database directly</p>
          </div>
        </a>

        <a
          href="https://supabase.com/docs/guides/functions"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Edge Functions Docs</p>
            <p className="text-sm text-gray-600">Learn about edge functions</p>
          </div>
        </a>

        <a
          href="https://modelcontextprotocol.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">MCP Documentation</p>
            <p className="text-sm text-gray-600">Model Context Protocol</p>
          </div>
        </a>
      </div>
    </div>
  );
}
