import { HTMLAttributes, forwardRef, useEffect } from 'react';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, className = '', children, ...props }, ref) => {
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'auto';
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />
        <div 
          ref={ref}
          className={`relative max-w-2xl mx-auto my-6 z-50 bg-white border border-slate-200/90 rounded-2xl shadow-xl flex flex-col w-full outline-none focus:outline-none animate-soft-in ${className}`}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);
Modal.displayName = 'Modal';

const ModalHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 rounded-t-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
ModalHeader.displayName = 'ModalHeader';

const ModalTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-semibold text-slate-900 tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
);
ModalTitle.displayName = 'ModalTitle';

const ModalBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative px-6 py-5 flex-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
ModalBody.displayName = 'ModalBody';

const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center justify-end px-6 py-4 border-t border-slate-100 rounded-b-2xl bg-slate-50/70 space-x-2.5 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter };
