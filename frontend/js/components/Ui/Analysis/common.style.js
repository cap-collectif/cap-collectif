// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import PickableList from '~ui/List/PickableList';

export const AnalysisPickableListContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin: 0 2rem 2rem 2rem;
`;

export const AnalysisProposalListHeaderContainer: any = styled(PickableList.Header)`
  align-items: stretch;
  & > *:not(.wrapper-checkbox-all-rows) {
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

export const AnalysisProposalListRowInformations: StyledComponent<
  {},
  {},
  HTMLDivElement,
> = styled.div`
  display: flex;
  align-items: center;
  & > * {
    margin: 0;
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

export const AnalysisProposalListNoContributions: StyledComponent<
  {},
  {},
  HTMLDivElement,
> = styled.div`
  padding: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${colors.darkGray};
  flex-direction: column;
  background: ${colors.white};
`;

export const AnalysisNoContributionIcon: StyledComponent<{}, {}, HTMLElement> = styled.i.attrs({
  className: 'cap-32 cap-baloon-1',
})`
  font-size: 4rem;
  margin-bottom: 10px;
`;

export const AnalysisProposalListLoader: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  font-weight: 600;
  & .loader {
    width: auto;
    & > div {
      margin: 0 2rem 0 0;
    }
  }
`;
