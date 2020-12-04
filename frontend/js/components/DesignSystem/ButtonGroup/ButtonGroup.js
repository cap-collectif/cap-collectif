// @flow
import * as React from 'react';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import Flex from '~ui/Primitives/Layout/Flex';

type Props = {|
  ...AppBoxProps,
|};

const ButtonGroup = React.forwardRef<Props, HTMLElement>(({ children, ...props }: Props, ref) => {
  return (
    <Flex ref={ref} {...props} spacing={4}>
      {children}
    </Flex>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
