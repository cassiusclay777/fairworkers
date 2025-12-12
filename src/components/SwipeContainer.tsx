import { motion, PanInfo } from 'framer-motion';
import { ReactNode } from 'react';

interface SwipeContainerProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function SwipeContainer({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  threshold = 100 
}: SwipeContainerProps) {
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;
    
    if (offset.x > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      drag="x"
      // eslint-disable-next-line logical-properties/physical-property-detected
      dragConstraints={{       }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

export default SwipeContainer;