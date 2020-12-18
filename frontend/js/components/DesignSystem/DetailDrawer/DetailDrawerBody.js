// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

type Props = {|
  ...AppBoxProps,
|};

const DetailDrawerBody = ({ children, ...props }: Props) => {
  return (
    <AppBox overflow="auto" px={6} {...props}>
      {children}
    </AppBox>
  );
};

DetailDrawerBody.displayName = 'DetailDrawer.Body';

export default DetailDrawerBody;
