// @flow
import * as React from 'react';
import {Box} from '@cap-collectif/ui'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

type Props = {|
  ...AppBoxProps,
|};

const DetailDrawerBody = ({ children, ...props }: Props) => {
  return (
    <Box overflow="auto" px={6} {...props}>
      {children}
    </Box>
  );
};

DetailDrawerBody.displayName = 'DetailDrawer.Body';

export default DetailDrawerBody;
