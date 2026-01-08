import { useState, useEffect } from 'react';
import { 
  Search, 
  Loader2, 
  Check, 
  X, 
  Star, 
  MessageSquare,
  ThumbsUp,
  Shield,
  Filter
} from 'lucide-react';
import { supabase, ProductReview } from '../../lib/supabase';

interface ReviewWithProduct extends ProductReview {
  products?: { name: string };
}

export function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('product_reviews')
        .select('*, products(name)')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('is_approved', false);
      } else if (filter === 'approved') {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: approved, updated_at: new Date().toISOString() })
        .eq('id', reviewId);

      if (error) throw error;
      loadReviews();
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const submitAdminResponse = async (reviewId: string) => {
    if (!adminResponse.trim()) return;
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('product_reviews')
        .update({ 
          admin_response: adminResponse,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;
      
      setRespondingTo(null);
      setAdminResponse('');
      loadReviews();
    } catch (error) {
      console.error('Error saving response:', error);
      alert('Failed to save response');
    } finally {
      setSaving(false);
    }
  };


  const filteredReviews = reviews.filter(
    review =>
      review.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.products?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = reviews.filter(r => !r.is_approved).length;
  const approvedCount = reviews.filter(r => r.is_approved).length;

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews</h1>
        <p className="text-gray-600">Moderate and manage customer reviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
          <p className="text-sm text-gray-600">Total Reviews</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-sm text-amber-700">Pending Approval</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-3xl font-bold text-emerald-600">{approvedCount}</p>
          <p className="text-sm text-emerald-700">Approved</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews by customer, product, or content..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-4 w-4" />
              All Reviews
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
              {pendingCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
          </div>
        </div>


        <div className="divide-y divide-gray-100">
          {filteredReviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="font-semibold text-gray-900">{review.customer_name}</span>
                    {review.is_verified_purchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        <Shield className="h-3 w-3" />
                        Verified Purchase
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        review.is_approved
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {review.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  {/* Product & Rating */}
                  <div className="flex items-center gap-4 mb-3">
                    {review.products?.name && (
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {review.products.name}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Review Content */}
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
                  )}
                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  {/* Helpful Count */}
                  {review.helpful_count > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <ThumbsUp className="h-4 w-4" />
                      {review.helpful_count} people found this helpful
                    </div>
                  )}

                  {/* Admin Response */}
                  {review.admin_response && (
                    <div className="mt-4 pl-4 border-l-2 border-emerald-300 bg-emerald-50 rounded-r-lg p-3">
                      <p className="text-sm font-medium text-emerald-800 mb-1">Store Response:</p>
                      <p className="text-sm text-emerald-700">{review.admin_response}</p>
                    </div>
                  )}

                  {/* Response Form */}
                  {respondingTo === review.id && (
                    <div className="mt-4 bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Response
                      </label>
                      <textarea
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Write a response to this review..."
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={() => {
                            setRespondingTo(null);
                            setAdminResponse('');
                          }}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => submitAdminResponse(review.id)}
                          disabled={saving || !adminResponse.trim()}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          Submit Response
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {!review.is_approved ? (
                    <button
                      onClick={() => updateReviewStatus(review.id, true)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => updateReviewStatus(review.id, false)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Unapprove"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  {!review.admin_response && respondingTo !== review.id && (
                    <button
                      onClick={() => {
                        setRespondingTo(review.id);
                        setAdminResponse('');
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Respond"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No reviews found</p>
          </div>
        )}
      </div>
    </div>
  );
}
