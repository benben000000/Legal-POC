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
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />
        <div 
          ref={ref}
          className={`relative w-auto max-w-3xl mx-auto my-6 z-50 bg-white border border-gray-200 rounded-[4px] shadow-sm flex flex-col w-full outline-none focus:outline-none ${className}`}
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
      className={`flex items-start justify-between p-4 border-b border-gray-200 rounded-t-[4px] ${className}`}
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
      className={`text-lg font-medium text-gray-900 ${className}`}
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
      className={`relative p-6 flex-auto ${className}`}
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
      className={`flex items-center justify-end p-4 border-t border-gray-200 rounded-b-[4px] bg-gray-50 space-x-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter };
