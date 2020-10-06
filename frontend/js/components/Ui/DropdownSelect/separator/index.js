// @flow
import * as React from 'react';
import * as S from './index.style';

type Props = {|
  +className?: string,
  +children: React.Node,
|};

const DropdownSelectSeparator = ({ children, className }: Props) => {
  return (
    <S.Container className={className}>
      <span>{children}</span>
    </S.Container>
  );
};

DropdownSelectSeparator.displayName = 'DropdownSelect.Separator';

export default DropdownSelectSeparator;
