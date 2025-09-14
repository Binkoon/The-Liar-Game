import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import '../styles/RefreshWarningModal.css';

const RefreshWarningModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="refresh-warning-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="refresh-warning-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="refresh-warning-content">
            <div className="warning-icon">
              ⚠️
            </div>
            <h3 className="warning-title">게임을 나가시겠습니까?</h3>
            <p className="warning-message">
              새로고침하거나 페이지를 나가면 게임에서 자동으로 제외됩니다.
              <br />
              <strong>게임 상태는 자동으로 복구됩니다.</strong>
            </p>
            
            <div className="warning-actions">
              <Button
                onClick={onCancel}
                variant="secondary"
                size="large"
                className="warning-btn warning-btn--cancel"
              >
                게임 계속하기
              </Button>
              <Button
                onClick={onConfirm}
                variant="primary"
                size="large"
                className="warning-btn warning-btn--confirm"
              >
                나가기
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RefreshWarningModal;
