// @flow
import styled, { type StyledComponent } from 'styled-components';

export const AnalysisDataContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;

  .analysis-status-container {
    display: flex;
    align-items: center;
    flex-direction: row;
    flex-shrink: 0;
  }
`;

export const AnalysisHeader: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;

  & > p {
    margin: 0;
  }
`;
