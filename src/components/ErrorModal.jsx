import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import '../styles/ErrorModal.css';

const ErrorModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="error-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="error-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="error-content">
            <div className="error-icon">
              ❌
            </div>
            <h3 className="error-title">오류가 발생했습니다</h3>
            <p className="error-message">{message}</p>
            
            <div className="error-actions">
              <Button
                onClick={onClose}
                variant="primary"
                size="large"
                className="error-btn"
              >
                로비로 돌아가기
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorModal;
