// @flow
import * as React from 'react';
import Text, { type TextProps } from '~ui/Primitives/Text';
import { headingStyles } from '~ui/Primitives/Heading';
import { FontWeight } from '~ui/Primitives/constants';

type Props = {|
  ...TextProps,
  +children: React$Node,
|};

const ModalHeaderLabel = ({ children, ...rest }: Props) => (
  <Text {...headingStyles.h5} color="gray.500" fontWeight={FontWeight.Bold} {...rest}>
    {children}
  </Text>
);

ModalHeaderLabel.displayName = 'Modal.Header.Label';

export default ModalHeaderLabel;
