import { useState } from 'react';
import { Lock, Mail, Loader2, ShieldCheck, Store } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(email, password);

    if (!success) {
      setError('Invalid email or password');
    }

    setLoading(false);
  };

  const handleBackToStore = () => {
    window.location.hash = '';
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwZmE2ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg3djJ2N2gtMXYtNmgtMXY2aC0xdi02aC0xdjZoLTF2LTZoLTF2Nmgtdi04eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative">
        {/* Back to Store Button */}
        <button
          onClick={handleBackToStore}
          className="absolute -top-16 left-0 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <Store className="h-5 w-5" />
          <span>Back to Store</span>
        </button>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ThriftySouq Admin
            </h1>
            <p className="text-gray-600 mt-2">Sign in to manage your store</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50/50 transition-all"
                  placeholder="admin@thriftysouq.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <p className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Demo Credentials
            </p>
            <div className="space-y-1">
              <p className="text-sm text-emerald-700">
                <span className="text-gray-600">Email:</span>{' '}
                <code className="bg-white px-2 py-0.5 rounded text-emerald-600">admin@luxe.com</code>
              </p>
              <p className="text-sm text-emerald-700">
                <span className="text-gray-600">Password:</span>{' '}
                <code className="bg-white px-2 py-0.5 rounded text-emerald-600">admin123</code>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-emerald-400/60 text-sm mt-6">
          © 2024 ThriftySouq. All rights reserved.
        </p>
      </div>
    </div>
  );
}
