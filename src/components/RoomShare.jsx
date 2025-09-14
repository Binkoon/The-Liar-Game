import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { copyRoomLink, generateQRData } from '../utils/roomManager';
import '../styles/RoomShare.css';

const RoomShare = ({ roomCode, isOpen, onClose }) => {
  const [copyStatus, setCopyStatus] = useState({ success: false, message: '' });
  const [showQR, setShowQR] = useState(false);

  const handleCopyLink = async () => {
    const result = await copyRoomLink(roomCode);
    setCopyStatus(result);
    
    // 3초 후 상태 초기화
    setTimeout(() => {
      setCopyStatus({ success: false, message: '' });
    }, 3000);
  };

  const roomURL = `${window.location.origin}/room/${roomCode}/join`;
  const qrDataURL = generateQRData(roomCode);

  if (!isOpen) return null;

  return (
    <motion.div
      className="room-share-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="room-share-modal"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="room-share-content">
          <div className="room-share-header">
            <h3 className="room-share-title">방 공유하기</h3>
            <button 
              className="room-share-close"
              onClick={onClose}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          <div className="room-share-body">
            <div className="room-code-section">
              <div className="room-code-display">
                <span className="room-code-label">방 코드</span>
                <span className="room-code-value">{roomCode}</span>
              </div>
              <p className="room-code-description">
                다른 플레이어들에게 이 코드를 알려주세요
              </p>
            </div>

            <div className="room-link-section">
              <div className="room-link-container">
                <input
                  type="text"
                  value={roomURL}
                  readOnly
                  className="room-link-input"
                />
                <Button
                  onClick={handleCopyLink}
                  variant={copyStatus.success ? "success" : "primary"}
                  size="medium"
                  className="copy-btn"
                >
                  {copyStatus.success ? '✓' : '복사'}
                </Button>
              </div>
              {copyStatus.message && (
                <p className={`copy-status ${copyStatus.success ? 'success' : 'error'}`}>
                  {copyStatus.message}
                </p>
              )}
            </div>

            <div className="qr-section">
              <Button
                onClick={() => setShowQR(!showQR)}
                variant="secondary"
                size="medium"
                className="qr-toggle-btn"
              >
                {showQR ? 'QR코드 숨기기' : 'QR코드 보기'}
              </Button>
              
              {showQR && (
                <motion.div
                  className="qr-container"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="qr-code">
                    <img
                      src={qrDataURL}
                      alt="방 QR코드"
                      className="qr-image"
                    />
                  </div>
                  <p className="qr-description">
                    QR코드를 스캔하여 방에 참여하세요
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          <div className="room-share-footer">
            <Button
              onClick={onClose}
              variant="primary"
              size="large"
              className="close-btn"
            >
              완료
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RoomShare;
