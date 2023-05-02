// @flow
import * as React from 'react';
import styled from 'styled-components';
import { AnimatePresence, m as motion } from 'framer-motion';
import { LAYOUT_TRANSITION_SPRING } from '~/utils/motion';
import SkeletonText from '~ds/Skeleton/text';
import SkeletonCircle from '~ds/Skeleton/circle';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import AppBox from '~ui/Primitives/AppBox';

export type SkeletonProps = {|
  ...AppBoxProps,
  +isLoaded: ?boolean,
  +children: React.Node,
  +placeholder: React.Node,
  +animate?: boolean,
|};

const SkeletonInner = styled(motion(AppBox))``;

const Skeleton = ({
  isLoaded = false,
  children,
  placeholder,
  ...rest
}: SkeletonProps): React.Node => (
  <AnimatePresence>
    {isLoaded ? (
      <SkeletonInner
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={LAYOUT_TRANSITION_SPRING}
        exit={{ opacity: 0 }}
        {...rest}>
        {children}
      </SkeletonInner>
    ) : (
      placeholder
    )}
  </AnimatePresence>
);

Skeleton.Text = SkeletonText;
Skeleton.Circle = SkeletonCircle;

export default Skeleton;
