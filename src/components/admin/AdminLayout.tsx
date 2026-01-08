import { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Star,
  DollarSign,
  Tag,
  LogOut,
  Menu,
  X,
  CreditCard,
  Webhook,
  Download,
  Palette,
  Users,
  Settings,
  Zap,
  Store,
  Link2,
  ChevronRight,
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function AdminLayout({ children, currentPage, onPageChange }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAdmin();

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'dashboard', color: 'text-blue-500' },
    { name: 'Products', icon: Package, page: 'products', color: 'text-purple-500' },
    { name: 'Orders', icon: ShoppingCart, page: 'orders', color: 'text-emerald-500' },
    { name: 'Reviews', icon: Star, page: 'reviews', color: 'text-amber-500' },
    { name: 'Coupons', icon: Tag, page: 'coupons', color: 'text-pink-500' },
    { name: 'Currencies', icon: DollarSign, page: 'currencies', color: 'text-green-500' },
    { name: 'Payment Methods', icon: CreditCard, page: 'payments', color: 'text-indigo-500' },
    { name: 'Webhooks', icon: Webhook, page: 'webhooks', color: 'text-orange-500' },
    { name: 'Import/Export', icon: Download, page: 'import-export', color: 'text-cyan-500' },
    { name: 'MCP & Functions', icon: Zap, page: 'mcp', color: 'text-yellow-500' },
    { name: 'Hero Settings', icon: Palette, page: 'hero-settings', color: 'text-rose-500' },
    { name: 'Footer', icon: Link2, page: 'footer', color: 'text-teal-500' },
    { name: 'Admin Users', icon: Users, page: 'users', color: 'text-violet-500' },
    { name: 'Settings', icon: Settings, page: 'settings', color: 'text-gray-500' },
  ];

  const handleBackToStore = () => {
    window.location.hash = '';
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          ThriftySouq
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}


      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 shadow-xl lg:shadow-none`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ThriftySouq
              </h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-700 font-semibold text-sm">
                {admin?.firstName?.[0]}{admin?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {admin?.firstName} {admin?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.name}
                onClick={() => {
                  onPageChange(item.page);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
                <span className="font-medium flex-1 text-left">{item.name}</span>
                {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50/50">
          <button
            onClick={handleBackToStore}
            className="w-full flex items-center gap-3 px-4 py-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors font-medium"
          >
            <Store className="h-5 w-5" />
            <span>View Store</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
