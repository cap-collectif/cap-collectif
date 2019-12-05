// @flow
import styled, { type StyledComponent } from 'styled-components';

export const WrapperDate: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'wrapperDate',
})`
  display: inline-flex;
  flex-direction: row;
  vertical-align: top;

  span {
    margin-right: 5px;
  }
`;

export default WrapperDate;
