import { useState } from 'react';
import { AdminProvider, useAdmin } from '../../contexts/AdminContext';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminOrders } from './AdminOrders';
import { AdminReviews } from './AdminReviews';
import { AdminPaymentMethods } from './AdminPaymentMethods';
import { AdminCoupons } from './AdminCoupons';
import { AdminCurrencies } from './AdminCurrencies';
import { AdminWebhooks } from './AdminWebhooks';
import { AdminImportExport } from './AdminImportExport';
import { AdminMCP } from './AdminMCP';
import { AdminHeroSettings } from './AdminHeroSettings';
import { AdminFooter } from './AdminFooter';
import { AdminUsers } from './AdminUsers';
import { AdminSettings } from './AdminSettings';

function AdminContent() {
  const { isAuthenticated } = useAdmin();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard onPageChange={setCurrentPage} />;
      case 'products':
        return <AdminProducts />;
      case 'categories':
        return <AdminCategories />;
      case 'orders':
        return <AdminOrders />;
      case 'reviews':
        return <AdminReviews />;
      case 'coupons':
        return <AdminCoupons />;
      case 'currencies':
        return <AdminCurrencies />;
      case 'payments':
        return <AdminPaymentMethods />;
      case 'webhooks':
        return <AdminWebhooks />;
      case 'import-export':
        return <AdminImportExport />;
      case 'mcp':
        return <AdminMCP />;
      case 'hero-settings':
        return <AdminHeroSettings />;
      case 'footer':
        return <AdminFooter />;
      case 'users':
        return <AdminUsers />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </AdminLayout>
  );
}

export function Admin() {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  );
}
