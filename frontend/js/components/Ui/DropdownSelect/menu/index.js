// @flow
import * as React from 'react';
import styled from 'styled-components';
import * as S from './index.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import DropdownSelectChoice from '~ui/DropdownSelect/choice';

export type DropdownSelectPointing = 'left' | 'right';

type Props = {|
  +name: string,
  +pointing?: DropdownSelectPointing,
  +children: React.ChildrenArray<
    // eslint-disable-next-line no-use-before-define
    React.Element<typeof DropdownSelectChoice> | React.Element<typeof DropdownSelectMenu>,
  >,
|};

const ArrowIcon = styled(Icon)`
  transform: scaleX(-1);
`;

const DropdownSelectMenu = ({ children, name, pointing = 'right' }: Props) => {
  return (
    <S.Container pointing={pointing}>
      <S.ContainerInner>
        <span>{name}</span>
        <ArrowIcon name={ICON_NAME.chevronLeft} size="1rem" />
      </S.ContainerInner>
      <S.ListContainer>
        <ul>{children}</ul>
      </S.ListContainer>
    </S.Container>
  );
};

DropdownSelectMenu.displayName = 'DropdownSelect.Menu';

export default DropdownSelectMenu;
