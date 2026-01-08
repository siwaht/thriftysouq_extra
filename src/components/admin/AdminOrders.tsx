import { useState, useEffect } from 'react';
import { 
  Search, 
  Loader2, 
  Eye, 
  X, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  XCircle,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  ChevronDown
} from 'lucide-react';
import { supabase, Order } from '../../lib/supabase';

interface OrderItem {
  id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderItems = async (orderId: string) => {
    try {
      setLoadingItems(true);
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Error loading order items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const openOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    await loadOrderItems(order.id);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };


  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
        <p className="text-gray-600">Manage customer orders and fulfillment</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order number, customer name or email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'processing', 'shipped', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                    {orders.filter(o => o.status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>


        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{order.order_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openOrderDetail(order)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      </div>


      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order {selectedOrder.order_number}</h2>
                <p className="text-gray-600 mt-1">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Update */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                      Payment: {selectedOrder.payment_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Update Status:</span>
                    <div className="relative">
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                        disabled={updatingStatus}
                        className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm font-medium disabled:opacity-50"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer & Shipping Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-gray-400" />
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <p className="font-medium text-gray-900">{selectedOrder.customer_name}</p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedOrder.customer_email}
                    </p>
                    {selectedOrder.shipping_address?.phone && (
                      <p className="text-gray-600 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedOrder.shipping_address.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    Shipping Address
                  </h3>
                  {selectedOrder.shipping_address ? (
                    <div className="text-gray-600 space-y-1">
                      <p>{selectedOrder.shipping_address.street}</p>
                      <p>
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}
                      </p>
                      <p>{selectedOrder.shipping_address.country}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No shipping address provided</p>
                  )}
                </div>
              </div>


              {/* Order Items */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-400" />
                    Order Items
                  </h3>
                </div>
                {loadingItems ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mx-auto" />
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {orderItems.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">
                            {item.quantity} × {formatCurrency(item.unit_price)}
                          </p>
                          <p className="font-semibold text-gray-900">{formatCurrency(item.total_price)}</p>
                        </div>
                      </div>
                    ))}
                    {orderItems.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        No items found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  Order Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{formatCurrency(selectedOrder.shipping_amount)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>
                {selectedOrder.payment_method && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Payment Method: <span className="font-medium">{selectedOrder.payment_method}</span>
                    </p>
                    {selectedOrder.payment_id && (
                      <p className="text-sm text-gray-500 mt-1">
                        Transaction ID: {selectedOrder.payment_id}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {selectedOrder.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="font-semibold text-amber-800 mb-2">Order Notes</h3>
                  <p className="text-amber-700">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
