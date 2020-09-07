// @flow
import styled, { type StyledComponent } from 'styled-components';

export type Colors = {|
  name: string,
|};

export const Container: StyledComponent<
  { nameColor: string },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'user-slide',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
  max-height: 100px;
  font-size: 16px;

  & > div {
    display: flex;
    flex-direction: column;
  }

  .name,
  .job {
    margin: 0;
  }

  .name {
    color: ${props => props.nameColor};
    font-weight: bold;
  }

  .job {
    color: #ababab;
    font-weight: 600;
    font-size: 12px;
  }

  img {
    width: 50px;
    border-radius: 25px;
    height: auto;
    margin-right: 14px;
  }
`;
