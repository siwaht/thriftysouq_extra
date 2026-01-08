import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FooterSection {
  id: string;
  title: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FooterLink {
  id: string;
  section_id: string;
  label: string;
  url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function AdminFooter() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Section modal state
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<FooterSection | null>(null);
  const [sectionFormData, setSectionFormData] = useState({
    title: '',
    display_order: 0,
    is_active: true,
  });

  // Link modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string>('');
  const [linkFormData, setLinkFormData] = useState({
    label: '',
    url: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, linksRes] = await Promise.all([
        supabase.from('footer_sections').select('*').order('display_order'),
        supabase.from('footer_links').select('*').order('display_order'),
      ]);

      if (sectionsRes.error) throw sectionsRes.error;
      if (linksRes.error) throw linksRes.error;

      setSections(sectionsRes.data || []);
      setLinks(linksRes.data || []);
    } catch (error) {
      console.error('Error loading footer data:', error);
      alert('Failed to load footer data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Section handlers
  const openSectionModal = (section?: FooterSection) => {
    if (section) {
      setEditingSection(section);
      setSectionFormData({
        title: section.title,
        display_order: section.display_order,
        is_active: section.is_active,
      });
    } else {
      setEditingSection(null);
      setSectionFormData({
        title: '',
        display_order: sections.length,
        is_active: true,
      });
    }
    setShowSectionModal(true);
  };

  const closeSectionModal = () => {
    setShowSectionModal(false);
    setEditingSection(null);
    setSectionFormData({ title: '', display_order: 0, is_active: true });
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSection) {
        const { error } = await supabase
          .from('footer_sections')
          .update(sectionFormData)
          .eq('id', editingSection.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('footer_sections')
          .insert([sectionFormData]);
        if (error) throw error;
      }
      closeSectionModal();
      loadData();
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Failed to save section');
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm('Are you sure? This will delete all links in this section.')) return;
    try {
      const { error } = await supabase.from('footer_sections').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section');
    }
  };

  const toggleSectionActive = async (section: FooterSection) => {
    try {
      const { error } = await supabase
        .from('footer_sections')
        .update({ is_active: !section.is_active })
        .eq('id', section.id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error toggling section:', error);
      alert('Failed to update section');
    }
  };

  // Link handlers
  const openLinkModal = (sectionId: string, link?: FooterLink) => {
    setCurrentSectionId(sectionId);
    if (link) {
      setEditingLink(link);
      setLinkFormData({
        label: link.label,
        url: link.url,
        display_order: link.display_order,
        is_active: link.is_active,
      });
    } else {
      setEditingLink(null);
      const sectionLinks = links.filter(l => l.section_id === sectionId);
      setLinkFormData({
        label: '',
        url: '',
        display_order: sectionLinks.length,
        is_active: true,
      });
    }
    setShowLinkModal(true);
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
    setEditingLink(null);
    setCurrentSectionId('');
    setLinkFormData({ label: '', url: '', display_order: 0, is_active: true });
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLink) {
        const { error } = await supabase
          .from('footer_links')
          .update(linkFormData)
          .eq('id', editingLink.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('footer_links')
          .insert([{ ...linkFormData, section_id: currentSectionId }]);
        if (error) throw error;
      }
      closeLinkModal();
      loadData();
    } catch (error) {
      console.error('Error saving link:', error);
      alert('Failed to save link');
    }
  };

  const deleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      const { error } = await supabase.from('footer_links').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Failed to delete link');
    }
  };

  const toggleLinkActive = async (link: FooterLink) => {
    try {
      const { error } = await supabase
        .from('footer_links')
        .update({ is_active: !link.is_active })
        .eq('id', link.id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error toggling link:', error);
      alert('Failed to update link');
    }
  };

  const getSectionLinks = (sectionId: string) => {
    return links.filter(link => link.section_id === sectionId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Footer Management</h2>
          <p className="text-gray-600 mt-1">Manage footer sections and links</p>
        </div>
        <button
          onClick={() => openSectionModal()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Section
        </button>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const sectionLinks = getSectionLinks(section.id);
          const isExpanded = expandedSections.has(section.id);

          return (
            <div key={section.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-600">{sectionLinks.length} links</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      section.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {section.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openLinkModal(section.id)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Add Link"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleSectionActive(section)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={section.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {section.is_active ? '👁️' : '🚫'}
                  </button>
                  <button
                    onClick={() => openSectionModal(section)}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4">
                  {sectionLinks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No links in this section
                      <button
                        onClick={() => openLinkModal(section.id)}
                        className="block mx-auto mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Add your first link
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sectionLinks.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <LinkIcon className="w-4 h-4 text-gray-400" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{link.label}</p>
                              <p className="text-sm text-gray-600">{link.url}</p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                link.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {link.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => toggleLinkActive(link)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title={link.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {link.is_active ? '👁️' : '🚫'}
                            </button>
                            <button
                              onClick={() => openLinkModal(section.id, link)}
                              className="p-1 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteLink(link.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {sections.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No footer sections found</p>
            <button
              onClick={() => openSectionModal()}
              className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Create your first section
            </button>
          </div>
        )}
      </div>

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              {editingSection ? 'Edit Section' : 'Add Section'}
            </h3>
            <form onSubmit={handleSectionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={sectionFormData.title}
                  onChange={(e) =>
                    setSectionFormData({ ...sectionFormData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Support"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={sectionFormData.display_order}
                  onChange={(e) =>
                    setSectionFormData({
                      ...sectionFormData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="section_active"
                  checked={sectionFormData.is_active}
                  onChange={(e) =>
                    setSectionFormData({ ...sectionFormData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="section_active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={closeSectionModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {editingSection ? 'Update' : 'Create'} Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              {editingLink ? 'Edit Link' : 'Add Link'}
            </h3>
            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Label
                </label>
                <input
                  type="text"
                  value={linkFormData.label}
                  onChange={(e) => setLinkFormData({ ...linkFormData, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Contact Us"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="text"
                  value={linkFormData.url}
                  onChange={(e) => setLinkFormData({ ...linkFormData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., /contact"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={linkFormData.display_order}
                  onChange={(e) =>
                    setLinkFormData({
                      ...linkFormData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="link_active"
                  checked={linkFormData.is_active}
                  onChange={(e) =>
                    setLinkFormData({ ...linkFormData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="link_active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={closeLinkModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {editingLink ? 'Update' : 'Create'} Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
