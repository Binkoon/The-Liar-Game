import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  className = '',
  type = 'button'
}) => {
  const buttonClasses = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    disabled ? 'btn--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { 
        scale: 1.05, 
        y: -1,
        transition: { 
          duration: 0.2, 
          ease: [0.25, 0.1, 0.25, 1] 
        }
      }}
      whileTap={disabled ? {} : { 
        scale: 0.98,
        y: 0,
        transition: { 
          duration: 0.1, 
          ease: [0.25, 0.1, 0.25, 1] 
        }
      }}
      transition={{ 
        duration: 0.3, 
        ease: [0.25, 0.1, 0.25, 1] 
      }}
    >
      {children}
    </motion.button>
  );
};

export default Button;
