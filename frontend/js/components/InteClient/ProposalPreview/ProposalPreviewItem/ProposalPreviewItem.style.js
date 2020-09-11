// @flow
import styled, { type StyledComponent } from 'styled-components';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';

export type Colors = {|
  button: string,
  name: string,
|};

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'proposal-preview-item',
})`
  display: flex;
  flex-direction: column;
  border: 1px solid #e8ebed;
  background-color: #fff;
  padding: 20px;

  .proposal-content {
    margin: 20px 0;
  }
`;

export const Header: StyledComponent<{ btnColor: string }, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;

  img {
    width: 55px;
    border-radius: 26.5px;
  }

  a {
    background-color: ${props => props.btnColor};
    color: #fff;
    padding: 8px 14px;
    text-transform: uppercase;
    font-size: 12px;
    ${MAIN_BORDER_RADIUS};
  }
`;

export const Footer: StyledComponent<{ authorColor: string }, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;

  .author,
  .job {
    margin: 0;
  }

  .author {
    margin-bottom: 4px;
    color: ${props => props.authorColor};
    font-weight: bold;
  }

  .job {
    color: #ababab;
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 2px;
  }
`;

export default Container;
