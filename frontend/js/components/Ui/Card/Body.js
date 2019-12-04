// @flow
import styled, { type StyledComponent } from 'styled-components';

const Body: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'card__body',
})`
  display: flex;
  padding: 15px;
  flex: 1 0 auto;
  flex-direction: column;
  word-wrap: break-word;

  hr {
    margin: 15px 0 10px;
  }

  @media print {
    display: block;
    padding: 0;
  }
`;

export default Body;
