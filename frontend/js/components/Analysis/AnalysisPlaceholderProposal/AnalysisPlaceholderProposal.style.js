// @flow
import styled, { type StyledComponent } from 'styled-components';
import { blink } from '~/utils/styles/keyframes';

export const InformationsContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 50%;
  width: 50%;
  animation: ${blink} 0.6s linear infinite alternate;
`;

export const HeaderInformations: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;

  .text-row {
    margin-top: 10px !important;
    width: 350px !important;

    &:first-of-type {
      opacity: 0.15;
      width: 200px !important;
      margin-top: 4px !important;
    }
  }
`;

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

export const ListRowMeta: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;

  & .tag {
    margin-right: 10px;
  }
`;
