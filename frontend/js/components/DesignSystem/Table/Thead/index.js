// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import { headingStyles } from '~ui/Primitives/Heading';
import { FontWeight } from '~ui/Primitives/constants';
import Tr from '~ds/Table/Tr';

type TheadProps = {|
  ...AppBoxProps,
  +children: React.Element<typeof Tr>,
|};

const Thead = ({ children, ...props }: TheadProps): React.Node => (
  <AppBox
    as="thead"
    bg="gray.100"
    color="gray.500"
    {...headingStyles.h5}
    fontWeight={FontWeight.Semibold}
    {...props}>
    {React.cloneElement(children, { inHead: true })}
  </AppBox>
);

Thead.displayName = 'Table.Thead';

export default Thead;
