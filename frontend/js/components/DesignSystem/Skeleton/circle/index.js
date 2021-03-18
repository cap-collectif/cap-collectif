// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

export type SkeletonCircleProps = {|
  ...AppBoxProps,
  size: number | string,
|};

const SkeletonCircle = ({ size, ...props }: SkeletonCircleProps): React.Node => (
  <AppBox bg="gray.150" width={size} height={size} borderRadius="50px" {...props} />
);

SkeletonCircle.displayName = 'SkeletonCircle';

export default SkeletonCircle;
