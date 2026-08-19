interface FormActionsProps {
  isLoading: boolean;
  isEdit: boolean;
  onCancel: () => void;
}

export function FormActions({ isLoading, isEdit, onCancel }: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-semibold rounded-xl border cursor-pointer disabled:opacity-50"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="px-5 py-2 text-sm font-semibold rounded-xl text-white transition-all cursor-pointer disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))',
          boxShadow: 'var(--shadow-glow-primary)',
        }}
      >
        {isLoading ? 'Saving...' : isEdit ? 'Update Media' : 'Add Media'}
      </button>
    </div>
  );
}
