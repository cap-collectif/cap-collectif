// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

export type VisuallyHiddenProps = AppBoxProps;

export const VisuallyHidden = React.forwardRef<VisuallyHiddenProps, HTMLElement>(
  ({ children, ...props }: VisuallyHiddenProps, ref) => {
    return (
      <AppBox
        as="span"
        border="none"
        clip="rect(0px, 0px, 0px, 0px)"
        height="1px"
        width="1px"
        margin="-1px"
        padding={0}
        overflow="hidden"
        whiteSpace="nowrap"
        position="absolute"
        ref={ref}
        {...props}>
        {children}
      </AppBox>
    );
  },
);

VisuallyHidden.displayName = 'VisuallyHidden';

export default VisuallyHidden;
