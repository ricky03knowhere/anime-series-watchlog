import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Tags,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { genreApi } from '@/api/genreApi';
import { useToast } from '@/contexts/ToastContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import Modal from '@/components/Modal';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';
import type { Genre } from '@/types';

function GenresPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [deletingGenre, setDeletingGenre] = useState<Genre | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const { data: genresRes, isLoading, isError } = useQuery({
    queryKey: ['genres-management', search],
    queryFn: () => genreApi.getAll({ search }),
  });

  const genres = genresRes?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => genreApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres-management'] });
      queryClient.invalidateQueries({ queryKey: ['genres-list'] });
      showToast('Genre created successfully!', 'success');
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to create genre', 'error');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; description?: string } }) =>
      genreApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres-management'] });
      queryClient.invalidateQueries({ queryKey: ['genres-list'] });
      showToast('Genre updated successfully!', 'success');
      setEditingGenre(null);
      resetForm();
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update genre', 'error');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => genreApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres-management'] });
      queryClient.invalidateQueries({ queryKey: ['genres-list'] });
      showToast('Genre deleted successfully!', 'success');
      setDeletingGenre(null);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to delete genre', 'error');
    },
  });

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (genre: Genre) => {
    setFormName(genre.name);
    setFormDesc(genre.description || '');
    setEditingGenre(genre);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Genre name is required', 'error');
      return;
    }

    if (editingGenre) {
      updateMutation.mutate({ id: editingGenre.id, data: { name: formName, description: formDesc } });
    } else {
      createMutation.mutate({ name: formName, description: formDesc });
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ─── Header ─── */}
      <div
        className="relative overflow-hidden rounded-3xl border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #101e35, #1d1838, #101e35)'
            : 'linear-gradient(135deg, #ecfeff, #fae8ff, #fef3c7)',
          borderColor: 'var(--color-primary-300)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
              color: 'white',
            }}
          >
            <Tags size={24} />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              Genre Management
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Organize, add, edit, and manage anime & TV series genres
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 cursor-pointer shrink-0 self-start sm:self-auto"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))' }}
        >
          <Plus size={18} /> Add New Genre
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
          placeholder="Search genres by name..."
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
          title="Failed to load genres"
          description="Check backend server connection and try again."
          emoji="⚠️"
        />
      )}

      {/* ─── Genres Grid ─── */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {genres.map((genre, idx) => (
            <motion.div
              key={genre.id}
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
                    className="text-lg font-black truncate group-hover:text-cyan-500 transition-colors"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                  >
                    {genre.name}
                  </h3>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(genre)}
                      className="p-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--border)' }}
                      title="Edit Genre"
                    >
                      <Edit2 size={14} className="text-purple-500" />
                    </button>
                    <button
                      onClick={() => setDeletingGenre(genre)}
                      className="p-1.5 rounded-lg border hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--border)' }}
                      title="Delete Genre"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-medium text-gray-500 mb-4 line-clamp-3">
                  {genre.description || 'No description added for this genre.'}
                </p>
              </div>

              <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[11px] font-semibold text-gray-400">
                  Added {new Date(genre.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => navigate(`/genres/${genre.id}`)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-cyan-500 hover:underline cursor-pointer"
                >
                  View Details <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── Add/Edit Modal ─── */}
      <Modal
        isOpen={isCreateOpen || !!editingGenre}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingGenre(null);
        }}
        title={editingGenre ? 'Edit Genre' : 'Add New Genre'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>
              Genre Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Cyberpunk, Action, Slice of Life"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>
              Description
            </label>
            <textarea
              placeholder="Brief description of the genre characteristics..."
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
                setEditingGenre(null);
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
              {editingGenre ? 'Save Changes' : 'Create Genre'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Confirm Delete Dialog ─── */}
      <ConfirmDialog
        isOpen={!!deletingGenre}
        title={`Delete "${deletingGenre?.name}"?`}
        message="Are you sure you want to delete this genre? If titles are linked to this genre, the link will be removed."
        confirmText="Yes, Delete"
        onConfirm={() => deletingGenre && deleteMutation.mutate(deletingGenre.id)}
        onCancel={() => setDeletingGenre(null)}
        isDestructive
      />
    </div>
  );
}

export default GenresPage;
