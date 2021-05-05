// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

type DefaultStyles = {|
  fontWeight: string,
  fontSize: string,
  color: string,
  uppercase: boolean,
|};

type ThProps = {|
  ...AppBoxProps,
  isNumeric?: boolean,
  children: React.Node | (({ styles: DefaultStyles }) => React.Node),
|};

const styles: DefaultStyles = {
  fontWeight: 'inherit',
  fontSize: 'inherit',
  color: 'inherit',
  uppercase: true,
};

const Th = ({ isNumeric, children, ...props }: ThProps): React.Node => (
  <AppBox as="th" py={4} px={4} textAlign={isNumeric ? 'right' : 'left'} uppercase {...props}>
    {typeof children === 'function' ? children({ styles }) : children}
  </AppBox>
);

Th.displayName = 'Table.Th';

export default Th;
