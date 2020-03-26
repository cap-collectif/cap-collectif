// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

type Props = {|
  +children: React.Node,
  +icon?: React.Node,
|};

const ICON_SIZE = '18px';

const DropdownSelectMessageContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 10px 10px 10px 15px;
  background: ${colors.white};
  border-bottom: 1px solid ${colors.lightGray};
  display: flex;

  & .message__icon__container {
    min-width: ${ICON_SIZE};
    max-width: ${ICON_SIZE};
    width: ${ICON_SIZE};
    margin-right: 10px;
  }
  & .message__container {
    & p {
      margin: 0;
    }
  }
  & i,
  svg {
    padding-top: 4px;
    margin-right: 1rem;
    width: 100%;
  }
`;

const DropdownSelectMessage = ({ children, icon }: Props) => {
  return (
    <DropdownSelectMessageContainer>
      {icon && <div className="message__icon__container">{icon}</div>}
      <div className="message__container">{children}</div>
    </DropdownSelectMessageContainer>
  );
};

DropdownSelectMessage.displayName = 'DropdownSelect.Message';

export default DropdownSelectMessage;
