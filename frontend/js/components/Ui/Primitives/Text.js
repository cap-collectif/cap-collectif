// @flow
import React from 'react';
import AppBox from './AppBox';
import { LineHeight } from '~ui/Primitives/constants';

// typings is handled by the .d.ts file
const Text: any = React.forwardRef((props, ref) => {
  return <AppBox ref={ref} as="p" fontFamily="body" lineHeight={LineHeight.Base} {...props} />;
});

Text.displayName = 'Text';

export default Text;
