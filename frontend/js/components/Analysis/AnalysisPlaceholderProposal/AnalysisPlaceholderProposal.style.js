// @flow
import styled, { type StyledComponent } from 'styled-components';

export const TagContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'tag',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 30%;

  .text-row {
    margin-top: 0 !important;
    margin-left: 10px;
  }
`;
