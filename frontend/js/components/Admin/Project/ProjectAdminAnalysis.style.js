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
