import { useState, useEffect } from 'react';
import { CartProvider } from './contexts/CartContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetail } from './components/ProductDetail';
import { CartSidebar } from './components/CartSidebar';
import { Checkout } from './components/Checkout';
import { Admin } from './components/admin/Admin';
import { InfoModal } from './components/InfoModal';
import { Product, supabase } from './lib/supabase';

interface FooterSection {
  id: string;
  title: string;
  display_order: number;
}

interface FooterLink {
  id: string;
  section_id: string;
  label: string;
  url: string;
  display_order: number;
}

function App() {
  const [view, setView] = useState<'store' | 'admin'>('store');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [footerSections, setFooterSections] = useState<FooterSection[]>([]);
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    type: 'contact' | 'shipping' | 'returns' | 'faq' | 'about' | 'privacy' | 'terms' | null;
  }>({ isOpen: false, type: null });

  useEffect(() => {
    const path = window.location.hash;
    if (path === '#admin') {
      setView('admin');
    }
    loadFooterData();
  }, []);

  const loadFooterData = async () => {
    try {
      const [sectionsRes, linksRes] = await Promise.all([
        supabase.from('footer_sections').select('*').eq('is_active', true).order('display_order'),
        supabase.from('footer_links').select('*').eq('is_active', true).order('display_order'),
      ]);

      if (sectionsRes.data) setFooterSections(sectionsRes.data);
      if (linksRes.data) setFooterLinks(linksRes.data);
    } catch (error) {
      console.error('Error loading footer data:', error);
    }
  };

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const closeInfoModal = () => {
    setInfoModal({ isOpen: false, type: null });
  };

  const getModalContent = () => {
    switch (infoModal.type) {
      case 'contact':
        return {
          title: 'Contact Us',
          content: (
            <div className="space-y-4">
              <p className="text-lg">We'd love to hear from you! Get in touch with our customer support team.</p>
              <div className="bg-emerald-50 p-4 rounded-lg space-y-2">
                <p><strong>Email:</strong> support@thriftysouq.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Hours:</strong> Monday - Friday, 9AM - 6PM EST</p>
              </div>
              <p className="text-sm text-gray-600">Response time: Within 24 hours</p>
            </div>
          ),
        };
      case 'shipping':
        return {
          title: 'Shipping Information',
          content: (
            <div className="space-y-4">
              <p className="text-lg font-semibold text-emerald-600">Free Shipping on Orders Over $50!</p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Standard Shipping</h3>
                  <p className="text-sm text-gray-600">5-7 business days - $4.99</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Express Shipping</h3>
                  <p className="text-sm text-gray-600">2-3 business days - $12.99</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Next Day Delivery</h3>
                  <p className="text-sm text-gray-600">1 business day - $24.99</p>
                </div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg mt-4">
                <p className="text-sm">All orders are processed within 1-2 business days. You'll receive a tracking number once your order ships.</p>
              </div>
            </div>
          ),
        };
      case 'returns':
        return {
          title: 'Returns & Refunds',
          content: (
            <div className="space-y-4">
              <p className="text-lg font-semibold text-emerald-600">30-Day Money Back Guarantee</p>
              <div className="space-y-3">
                <p>We stand behind the quality of our products. If you're not completely satisfied, return your purchase within 30 days for a full refund.</p>
                <div className="bg-emerald-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-gray-900">Return Policy</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Items must be in original condition with tags attached</li>
                    <li>Returns are free for defective items</li>
                    <li>Refunds processed within 5-7 business days</li>
                    <li>Original shipping costs are non-refundable</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600">To initiate a return, contact our support team with your order number.</p>
              </div>
            </div>
          ),
        };
      case 'faq':
        return {
          title: 'Frequently Asked Questions',
          content: (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I track my order?</h3>
                <p className="text-sm text-gray-600">Once your order ships, you'll receive a tracking number via email. You can use this to track your package.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-sm text-gray-600">We accept all major credit cards, PayPal, Apple Pay, and Google Pay.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you ship internationally?</h3>
                <p className="text-sm text-gray-600">Yes! We ship to most countries worldwide. International shipping rates vary by location.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Are your products authentic?</h3>
                <p className="text-sm text-gray-600">Absolutely! All our products are 100% authentic and come with a certificate of authenticity.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How can I change or cancel my order?</h3>
                <p className="text-sm text-gray-600">Contact us immediately at support@thriftysouq.com. Orders can only be modified before they ship.</p>
              </div>
            </div>
          ),
        };
      case 'about':
        return {
          title: 'About ThriftySouq',
          content: (
            <div className="space-y-4">
              <p className="text-lg">Your trusted marketplace for premium quality at thrifty prices.</p>
              <div className="space-y-3">
                <p>Founded in 2024, ThriftySouq was born from a simple idea: everyone deserves access to quality products at fair prices. We've built a curated marketplace that brings together the best brands and independent sellers, all committed to offering exceptional value.</p>
                <div className="bg-emerald-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-gray-900">Our Mission</h3>
                  <p className="text-sm">To democratize access to premium products by connecting conscious consumers with quality sellers who share our values of transparency, sustainability, and fair pricing.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Why Choose Us?</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Verified authentic products</li>
                    <li>30-day money-back guarantee</li>
                    <li>Free shipping on orders over $50</li>
                    <li>Dedicated customer support</li>
                    <li>Sustainable packaging</li>
                  </ul>
                </div>
              </div>
            </div>
          ),
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          content: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Last updated: January 2024</p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Information We Collect</h3>
                  <p className="text-sm text-gray-600">We collect information you provide directly to us, including name, email address, shipping address, and payment information when you make a purchase.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How We Use Your Information</h3>
                  <p className="text-sm text-gray-600">We use your information to process orders, communicate with you about your purchases, and improve our services. We never sell your personal information to third parties.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Security</h3>
                  <p className="text-sm text-gray-600">We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Your Rights</h3>
                  <p className="text-sm text-gray-600">You have the right to access, correct, or delete your personal information at any time. Contact us at privacy@thriftysouq.com for assistance.</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm">For our complete privacy policy, please contact our support team.</p>
                </div>
              </div>
            </div>
          ),
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          content: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Last updated: January 2024</p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Agreement to Terms</h3>
                  <p className="text-sm text-gray-600">By accessing and using ThriftySouq, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Use License</h3>
                  <p className="text-sm text-gray-600">Permission is granted to purchase and download products for personal, non-commercial use only. This license shall automatically terminate if you violate any of these restrictions.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Product Descriptions</h3>
                  <p className="text-sm text-gray-600">We strive to provide accurate product descriptions and images. However, we do not warrant that descriptions are error-free or complete.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Pricing</h3>
                  <p className="text-sm text-gray-600">All prices are subject to change without notice. We reserve the right to modify or discontinue products at any time.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Limitation of Liability</h3>
                  <p className="text-sm text-gray-600">ThriftySouq shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm">For complete terms and conditions, please contact our legal team at legal@thriftysouq.com.</p>
                </div>
              </div>
            </div>
          ),
        };
      default:
        return { title: '', content: null };
    }
  };

  if (view === 'admin') {
    return <Admin />;
  }

  return (
    <CurrencyProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Header
            onCartClick={() => setCartOpen(true)}
            onCategoryClick={setCategorySlug}
            onSearch={setSearchQuery}
          />

          <main>
            {!categorySlug && !searchQuery && <Hero />}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <ProductGrid
                categorySlug={categorySlug}
                searchQuery={searchQuery}
                onProductClick={setSelectedProduct}
              />
            </div>
          </main>

          <footer className="bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 text-white py-16 mt-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwZmE2ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg3djJ2N2gtMXYtNmgtMXY2aC0xdi02aC0xdjZoLTF2LTZoLTF2Nmgtdi04eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="grid md:grid-cols-4 gap-12 mb-12">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
                    ThriftySouq
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Your trusted marketplace for premium quality at thrifty prices. Discover value without compromise.
                  </p>
                  <div className="flex gap-3">
                    <button className="w-10 h-10 bg-emerald-600/20 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                    <button className="w-10 h-10 bg-emerald-600/20 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </button>
                    <button className="w-10 h-10 bg-emerald-600/20 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {footerSections.map((section) => (
                  <div key={section.id}>
                    <h4 className="font-semibold mb-4 text-emerald-400">{section.title}</h4>
                    <ul className="space-y-3 text-gray-400">
                      {footerLinks
                        .filter(link => link.section_id === section.id)
                        .map((link) => (
                          <li key={link.id}>
                            <a
                              href={link.url}
                              className="hover:text-emerald-400 transition-colors"
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="border-t border-emerald-900/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-400 text-sm">
                  &copy; 2024 ThriftySouq. All rights reserved.
                </p>
                <button
                  onClick={() => {
                    window.location.hash = 'admin';
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-sm font-medium rounded-lg transition-all duration-300 border border-emerald-600/30 hover:border-emerald-600"
                >
                  Admin Dashboard
                </button>
              </div>
            </div>
          </footer>

          <ProductDetail
            product={selectedProduct}
            isOpen={selectedProduct !== null}
            onClose={() => setSelectedProduct(null)}
          />

          <CartSidebar
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            onCheckout={handleCheckout}
          />

          <Checkout
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
          />

          <InfoModal
            isOpen={infoModal.isOpen}
            onClose={closeInfoModal}
            title={getModalContent().title}
          >
            {getModalContent().content}
          </InfoModal>
        </div>
      </CartProvider>
    </CurrencyProvider>
  );
}

export default App;
