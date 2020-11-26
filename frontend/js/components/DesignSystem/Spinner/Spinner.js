// @flow
import * as React from 'react';
import { css, keyframes } from 'styled-components';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import Icon from '~ds/Icon/Icon';

type Props = {|
  ...AppBoxProps,
|};

const spinning = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const Spinner = React.forwardRef<Props, HTMLElement>(({ ...props }: Props, ref) => {
  return (
    <Icon
      css={css`
        transform-origin: center center;
        animation: ${spinning} 1.7s linear infinite;
      `}
      ref={ref}
      {...props}
      name="SPINNER"
    />
  );
});

export default Spinner;
