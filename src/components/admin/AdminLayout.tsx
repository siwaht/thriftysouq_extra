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
    { name: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
    { name: 'Products', icon: Package, page: 'products' },
    { name: 'Orders', icon: ShoppingCart, page: 'orders' },
    { name: 'Reviews', icon: Star, page: 'reviews' },
    { name: 'Coupons', icon: Tag, page: 'coupons' },
    { name: 'Currencies', icon: DollarSign, page: 'currencies' },
    { name: 'Payment Methods', icon: CreditCard, page: 'payments' },
    { name: 'Webhooks', icon: Webhook, page: 'webhooks' },
    { name: 'Import/Export', icon: Download, page: 'import-export' },
    { name: 'Hero Settings', icon: Palette, page: 'hero-settings' },
    { name: 'Admin Users', icon: Users, page: 'users' },
    { name: 'Settings', icon: Settings, page: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          ThriftySouq Admin
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 z-40 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 shadow-xl`}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            ThriftySouq
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            {admin?.firstName} {admin?.lastName}
          </p>
        </div>

        <nav className="p-4 space-y-1">
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
