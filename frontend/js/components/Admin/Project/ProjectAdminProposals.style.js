// @flow
import styled, { type StyledComponent } from 'styled-components';
import { Label as BSLabel } from 'react-bootstrap';
import PickableList from '~ui/List/PickableList';
import colors from '~/utils/colors';

export const ProposalPickableList: StyledComponent<{}, {}, typeof PickableList> = styled(
  PickableList,
)`
  margin: 0 2rem 2rem 2rem;
`;

// would love to type it like this: StyledComponent<{}, {}, typeof PickableList.Row>, but it does not seems
// to work (in TypeScript it works)
export const ProposalListRow: any = styled(PickableList.Row)`
  display: flex;
  flex-direction: column;
  width: 100%;
  & h2 {
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 5px 0;
    line-height: 20px;
  }
`;

export const ProposalListRowInformations: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  align-items: center;
  & > * {
    margin: 0;
  }
`;

export const ProposalVotableStepTitle: StyledComponent<{}, {}, HTMLHeadingElement> = styled.h2`
  font-weight: 600;
`;

export const ProposalListRowInformationsStepState: StyledComponent<
  {},
  {},
  HTMLDivElement,
> = styled.div`
  display: flex;
  margin-left: auto;
  align-items: center;
  & > * + * {
    margin-left: 20px;
  }
  & h2 {
    margin-bottom: 0;
  }
`;

export const Label: StyledComponent<{}, {}, HTMLDivElement> = styled(BSLabel)`
  border-radius: 12px;
  padding: 6px;
`;

export const ProposalListRowMeta: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
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

export const ProposalListNoContributions: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${colors.darkGray};
  flex-direction: column;
`;

export const NoContributionIcon: StyledComponent<{}, {}, HTMLElement> = styled.i.attrs({
  className: 'cap-32 cap-baloon-1',
})`
  font-size: 4rem;
  margin-bottom: 10px;
`;

export const ProposalListLoader: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
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
