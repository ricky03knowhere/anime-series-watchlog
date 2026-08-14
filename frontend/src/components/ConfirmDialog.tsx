import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDestructive?: boolean;
}

function ConfirmDialog({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  isDestructive = true,
}: ConfirmDialogProps) {
  const handleClose = onClose || onCancel || (() => {});
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="md">
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ background: isDestructive ? '#fef2f2' : 'var(--color-primary-50)', color: isDestructive ? '#dc2626' : 'var(--color-primary-600)' }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold rounded-xl border transition-colors cursor-pointer disabled:opacity-50"
            style={{
              background: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-white transition-opacity cursor-pointer disabled:opacity-50"
            style={{
              background: isDestructive
                ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                : 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))',
              boxShadow: isDestructive ? '0 4px 12px rgba(220,38,38,0.25)' : 'var(--shadow-glow-primary)',
            }}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
