import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

const AnimatedCard = ({ 
  children, 
  className = '', 
  title, 
  delay = 0,
  duration = 0.3,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration,
        delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={className} title={title} {...props}>
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard;
