import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { studioApi } from '@/api/studioApi';
import { useToast } from '@/contexts/ToastContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import Modal from '@/components/Modal';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';
import type { Studio } from '@/types';

function StudiosPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStudio, setEditingStudio] = useState<Studio | null>(null);
  const [deletingStudio, setDeletingStudio] = useState<Studio | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formUrl, setFormUrl] = useState('');

  const { data: studiosRes, isLoading, isError } = useQuery({
    queryKey: ['studios-management', search],
    queryFn: () => studioApi.getAll({ search }),
  });

  const studios = studiosRes?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; website_url?: string }) =>
      studioApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studios-management'] });
      queryClient.invalidateQueries({ queryKey: ['studios-list'] });
      showToast('Studio created successfully!', 'success');
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to create studio', 'error');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; description?: string; website_url?: string } }) =>
      studioApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studios-management'] });
      queryClient.invalidateQueries({ queryKey: ['studios-list'] });
      showToast('Studio updated successfully!', 'success');
      setEditingStudio(null);
      resetForm();
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update studio', 'error');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => studioApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studios-management'] });
      queryClient.invalidateQueries({ queryKey: ['studios-list'] });
      showToast('Studio deleted successfully!', 'success');
      setDeletingStudio(null);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to delete studio', 'error');
    },
  });

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormUrl('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (studio: Studio) => {
    setFormName(studio.name);
    setFormDesc(studio.description || '');
    setFormUrl(studio.website_url || '');
    setEditingStudio(studio);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Studio name is required', 'error');
      return;
    }

    const payload = {
      name: formName,
      description: formDesc,
      website_url: formUrl || undefined,
    };

    if (editingStudio) {
      updateMutation.mutate({ id: editingStudio.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ─── Header ─── */}
      <div
        className="relative overflow-hidden rounded-3xl border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #1d1035, #101d35, #1d1035)'
            : 'linear-gradient(135deg, #fae8ff, #ecfeff, #f3e8ff)',
          borderColor: 'var(--color-primary-300)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              color: 'white',
            }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              Studio Management
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Manage production studios, animation houses, and TV networks
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 cursor-pointer shrink-0 self-start sm:self-auto"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))' }}
        >
          <Plus size={18} /> Add New Studio
        </button>
      </div>

      {/* ─── Search Bar ─── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search studios by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm bg-transparent outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* ─── Loading / Error ─── */}
      {isLoading && <LoadingSkeleton rows={5} />}

      {isError && (
        <EmptyState
          title="Failed to load studios"
          description="Check backend server connection and try again."
          emoji="⚠️"
        />
      )}

      {/* ─── Studios Grid ─── */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {studios.map((studio, idx) => (
            <motion.div
              key={studio.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group flex flex-col justify-between"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border)',
              }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3
                    className="text-lg font-black truncate group-hover:text-purple-500 transition-colors"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                  >
                    {studio.name}
                  </h3>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(studio)}
                      className="p-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--border)' }}
                      title="Edit Studio"
                    >
                      <Edit2 size={14} className="text-purple-500" />
                    </button>
                    <button
                      onClick={() => setDeletingStudio(studio)}
                      className="p-1.5 rounded-lg border hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--border)' }}
                      title="Delete Studio"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-medium text-gray-500 mb-3 line-clamp-3">
                  {studio.description || 'No studio description added.'}
                </p>

                {studio.website_url && (
                  <a
                    href={studio.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-500 hover:underline mb-4"
                  >
                    Website <ExternalLink size={10} />
                  </a>
                )}
              </div>

              <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[11px] font-semibold text-gray-400">
                  Added {new Date(studio.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => navigate(`/studios/${studio.id}`)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-500 hover:underline cursor-pointer"
                >
                  View Catalog <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── Add/Edit Modal ─── */}
      <Modal
        isOpen={isCreateOpen || !!editingStudio}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingStudio(null);
        }}
        title={editingStudio ? 'Edit Studio' : 'Add New Studio'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>
              Studio Name *
            </label>
            <input
              type="text"
              placeholder="e.g. MAPPA, Bones, Madhouse, Netflix"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>
              Website URL
            </label>
            <input
              type="url"
              placeholder="https://example.com"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>
              Description
            </label>
            <textarea
              placeholder="Brief overview of the studio's notable works or history..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingStudio(null);
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold border cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white cursor-pointer shadow-md"
              style={{ background: 'var(--color-primary-600)' }}
            >
              {editingStudio ? 'Save Changes' : 'Create Studio'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Confirm Delete Dialog ─── */}
      <ConfirmDialog
        isOpen={!!deletingStudio}
        title={`Delete "${deletingStudio?.name}"?`}
        message="Are you sure you want to delete this studio? Titles currently linked to this studio will have their studio unassigned."
        confirmText="Yes, Delete"
        onConfirm={() => deletingStudio && deleteMutation.mutate(deletingStudio.id)}
        onCancel={() => setDeletingStudio(null)}
        isDestructive
      />
    </div>
  );
}

export default StudiosPage;
