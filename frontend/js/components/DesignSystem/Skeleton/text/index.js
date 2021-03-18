// @flow
import * as React from 'react';
import { variant } from 'styled-system';
import styled, { type StyledComponent } from 'styled-components';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

export type SkeletonTextProps = {|
  ...AppBoxProps,
  size: 'sm' | 'md' | 'lg',
|};

const SkeletonTextInner: StyledComponent<{}, {}, any> = styled(AppBox)(
  variant({
    variants: {
      sm: {
        height: 4,
      },
      md: {
        height: 5,
      },
      lg: {
        height: 6,
      },
    },
  }),
);

const SkeletonText = ({ size, ...props }: SkeletonTextProps): React.Node => (
  <SkeletonTextInner bg="gray.150" borderRadius="placeholder" variant={size} {...props} />
);

SkeletonText.displayName = 'SkeletonText';

export default SkeletonText;
