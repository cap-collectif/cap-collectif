// @flow
import styled, { type StyledComponent } from 'styled-components';
import PickableList from '~ui/List/PickableList';
import colors from '~/utils/colors';
import Tag from '~ui/Labels/Tag';

export const AnalysisProposalContainer: StyledComponent<
  { hasSelection?: boolean },
  {},
  typeof PickableList.Row,
> = styled(PickableList.Row)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 90%;
`;

export const ProposalInformationsContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 50%;
  width: 50%;

  a {
    color: ${colors.primaryColor};
  }
`;

export const ProposalListRowHeader: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 0 5px 0;

  h2 {
    font-size: 15px;
    font-weight: 600;
    line-height: 20px;
    margin: 0;
  }
`;

export const StateTag: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  border-radius: 20px;
  font-weight: 600;
  font-size: 1.2rem;
  color: ${colors.darkGray};
  border: 1px solid ${colors.darkGray};
  padding: 0 4px;
  margin-right: 8px;
`;

export const ProposalListRowInformations: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  align-items: center;

  p {
    margin: 0;
  }
`;

export const ProposalTag: StyledComponent<{}, {}, typeof Tag> = styled(Tag)`
  max-width: 50%;

  &:hover {
    cursor: pointer;
    color: ${colors.primaryColor};
  }
`;

export default AnalysisProposalContainer;
