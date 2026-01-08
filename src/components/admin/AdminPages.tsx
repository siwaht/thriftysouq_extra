import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, X, Save, FileText, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PageFormData {
  slug: string;
  title: string;
  content: string;
  is_active: boolean;
}

export function AdminPages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState<PageFormData>({
    slug: '',
    title: '',
    content: '',
    is_active: true,
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('title');

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (page?: Page) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        slug: page.slug,
        title: page.title,
        content: page.content,
        is_active: page.is_active,
      });
    } else {
      setEditingPage(null);
      setFormData({
        slug: '',
        title: '',
        content: '',
        is_active: true,
      });
    }
    setPreviewMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPage(null);
    setPreviewMode(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const pageData = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        updated_at: new Date().toISOString(),
      };

      if (editingPage) {
        const { error } = await supabase
          .from('pages')
          .update(pageData)
          .eq('id', editingPage.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pages')
          .insert([pageData]);

        if (error) throw error;
      }

      await loadPages();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Failed to save page: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
      await loadPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Failed to delete page');
    }
  };

  const toggleActive = async (page: Page) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({ is_active: !page.is_active })
        .eq('id', page.id);

      if (error) throw error;
      await loadPages();
    } catch (error) {
      console.error('Error toggling page:', error);
    }
  };

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, i) => {
        // Headers
        if (paragraph.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-semibold text-gray-900 mt-4 mb-2">{paragraph.slice(4)}</h3>;
        }
        if (paragraph.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3">{paragraph.slice(3)}</h2>;
        }
        if (paragraph.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold text-gray-900 mt-6 mb-4">{paragraph.slice(2)}</h1>;
        }
        // Lists
        if (paragraph.includes('\n- ')) {
          const items = paragraph.split('\n- ').filter(Boolean);
          return (
            <ul key={i} className="list-disc list-inside space-y-1 my-3 text-gray-600">
              {items.map((item, j) => <li key={j}>{item}</li>)}
            </ul>
          );
        }
        // Regular paragraph
        return <p key={i} className="text-gray-600 mb-3">{paragraph}</p>;
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pages</h1>
          <p className="text-gray-600">Manage content pages (About Us, Privacy Policy, etc.)</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2 justify-center"
        >
          <Plus className="h-5 w-5" />
          Add Page
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Create pages for your footer links. Use the slug (e.g., "about-us", "privacy-policy") 
          as the URL in Footer Management. The content will display in a popup when clicked.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="divide-y divide-gray-100">
          {pages.map((page) => (
            <div key={page.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{page.title}</h3>
                    <p className="text-sm text-gray-500">/{page.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      page.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {page.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => toggleActive(page)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={page.is_active ? 'Deactivate' : 'Activate'}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleOpenModal(page)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pages.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No pages yet</p>
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Create your first page
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPage ? 'Edit Page' : 'Add New Page'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    previewMode
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {previewMode ? 'Edit' : 'Preview'}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {previewMode ? (
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{formData.title || 'Untitled'}</h1>
                <div className="prose max-w-none">
                  {renderContent(formData.content)}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-field"
                      placeholder="e.g., About Us"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="input-field"
                      placeholder="auto-generated-from-title"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used in footer link URLs</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={15}
                    className="input-field font-mono text-sm"
                    placeholder="Write your page content here...

Use simple formatting:
# Heading 1
## Heading 2
### Heading 3

- List item 1
- List item 2

Regular paragraphs are separated by blank lines."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supports basic formatting: # for headings, - for lists, blank lines for paragraphs
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active (visible on site)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {editingPage ? 'Update Page' : 'Create Page'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
