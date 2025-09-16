import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  title, 
  className = '', 
  variant = 'default',
  onClick,
  clickable = false
}) => {
  const cardClasses = [
    'card',
    `card--${variant}`,
    clickable ? 'card--clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.div 
      className={cardClasses}
      onClick={onClick}
      {...(clickable && {
        role: 'button',
        tabIndex: 0
      })}
      whileHover={clickable ? { 
        y: -2,
        scale: 1.02,
        transition: { 
          duration: 0.3, 
          ease: [0.25, 0.1, 0.25, 1] 
        }
      } : {}}
      whileTap={clickable ? { 
        scale: 0.98,
        y: 0,
        transition: { 
          duration: 0.15, 
          ease: [0.25, 0.1, 0.25, 1] 
        }
      } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.1
      }}
    >
      {title && <motion.div 
        className="card-header"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.2
        }}
      >
        <h3 className="card-title">{title}</h3>
      </motion.div>}
      <motion.div 
        className="card-content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.3
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default Card;
