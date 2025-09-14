import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

const AnimatedButton = ({ 
  children, 
  delay = 0,
  duration = 0.2,
  hoverScale = 1.05,
  tapScale = 0.95,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration,
        delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: hoverScale,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: tapScale,
        transition: { duration: 0.1 }
      }}
    >
      <Button {...props}>
        {children}
      </Button>
    </motion.div>
  );
};

export default AnimatedButton;
