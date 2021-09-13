// @flow
import styled, { css, type StyledComponent } from 'styled-components';

const Body: StyledComponent<
  { isHorizontal?: boolean, position?: 'relative' | 'absolute' },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'card__body',
})`
  display: flex;
  padding: 15px;
  flex: 1 0 auto;
  position: ${props => (props.position ? props.position : '')};
  flex-direction: ${props => (props.isHorizontal ? 'row' : 'column')};
  word-wrap: break-word;
  ${({ isHorizontal }) =>
    isHorizontal &&
    css`
      align-items: center;
      justify-content: space-between;
    `}

  hr {
    margin: 15px 0 10px;
  }

  @media print {
    display: block;
    padding: 0;
  }
`;

export default Body;
