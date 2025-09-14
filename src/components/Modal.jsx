import React from 'react';
import '../styles/Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showCloseButton = true,
  className = ''
}) => {
  if (!isOpen) return null;

  const modalClasses = [
    'modal',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={modalClasses} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          {showCloseButton && (
            <button 
              className="modal-close" 
              onClick={onClose}
              aria-label="닫기"
            >
              ×
            </button>
          )}
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
