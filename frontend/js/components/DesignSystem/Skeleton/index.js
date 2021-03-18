// @flow
import * as React from 'react';
import { AnimatePresence, m as motion } from 'framer-motion';
import { LAYOUT_TRANSITION_SPRING } from '~/utils/motion';
import SkeletonText from '~ds/Skeleton/text';
import SkeletonCircle from '~ds/Skeleton/circle';

export type SkeletonProps = {|
  +isLoaded: boolean,
  +children: React.Node,
  +placeholder: React.Node,
  +animate?: boolean,
|};

const Skeleton = ({
  isLoaded,
  children,
  animate = true,
  placeholder,
}: SkeletonProps): React.Node => (
  <AnimatePresence>
    {isLoaded ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={LAYOUT_TRANSITION_SPRING}
        exit={{ opacity: 0 }}>
        {children}
      </motion.div>
    ) : animate ? (
      <motion.div
        animate={{ opacity: 0 }}
        transition={{ duration: 1, repeatType: 'reverse', repeat: Infinity }}>
        {placeholder}
      </motion.div>
    ) : (
      placeholder
    )}
  </AnimatePresence>
);

Skeleton.Text = SkeletonText;
Skeleton.Circle = SkeletonCircle;

export default Skeleton;
