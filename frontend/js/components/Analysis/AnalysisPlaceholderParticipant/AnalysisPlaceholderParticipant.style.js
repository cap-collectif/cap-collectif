// @flow
import styled, { type StyledComponent } from 'styled-components';

export const InformationsContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  animation: blink 0.6s linear infinite alternate;

  @keyframes blink {
    from {
      opacity: 0.4;
    }
    to {
      opacity: 1;
    }
  }
`;

export const TagContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'tag',
})`
  display: flex;
  flex-direction: row;
  align-items: center;

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
