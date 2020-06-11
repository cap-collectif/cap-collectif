// @flow
import styled, { type StyledComponent } from 'styled-components';
import PickableList from '~ui/List/PickableList';

export const AnalysisPickableListContainer: StyledComponent<
  {},
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'analysis-pickable-list-container',
})`
  margin: 0 2rem 2rem 2rem;
`;

export const AnalysisProposalListHeaderContainer: any = styled(PickableList.Header)`
  align-items: stretch;
  & > *:not(.all-rows-checkbox) {
    margin: 0 30px 0 0;
    justify-content: flex-start;
    & p {
      margin-bottom: 0;
    }
  }
  & > p:first-of-type {
    flex: 3;
    align-self: start;
  }
`;

export const AnalysisProposalListFiltersContainer: StyledComponent<
  {},
  {},
  HTMLDivElement,
> = styled.div`
  display: flex;
  flex-direction: column;
`;

export const AnalysisProposalListFiltersAction: StyledComponent<
  {},
  {},
  HTMLDivElement,
> = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  & > * {
    margin: 0 30px 0 0;

    &:last-child {
      margin: 0;
    }
  }
`;

export const AnalysisProposalListFiltersList: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 10px;

  & > * {
    margin: 0 15px 0 0;

    &:last-child {
      margin: 0;
    }
  }
`;

export const AnalysisFilterContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export const AnalysisProposalListRowMeta: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  & .tag {
    margin-right: 10px;
    &:last-of-type {
      margin-right: 0;
    }
    & i {
      top: 0;
    }
  }
`;
