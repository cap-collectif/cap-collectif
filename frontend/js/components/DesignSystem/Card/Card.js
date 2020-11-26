// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

type Props = {|
  ...AppBoxProps,
|};

export const Card = ({ children, ...props }: Props) => {
  return (
    <AppBox p={6} borderRadius="card" border="card" borderColor="gray.150" {...props}>
      {children}
    </AppBox>
  );
};

export default Card;
