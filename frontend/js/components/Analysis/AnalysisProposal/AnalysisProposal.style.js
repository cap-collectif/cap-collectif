// @flow
import styled, { type StyledComponent } from 'styled-components';
import PickableList from '~ui/List/PickableList';

export const AnalysisProposalContainer: StyledComponent<
  { hasSelection?: boolean },
  {},
  typeof PickableList.Row,
> = styled(PickableList.Row)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex: 1;
  padding-right: ${props => (props.hasSelection ? '44px' : '100px')};
`;

export const ProposalInformationsContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  & > h2 {
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 5px 0;
    line-height: 20px;
  }
`;

export const ProposalListRowInformations: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  align-items: center;

  p {
    margin: 0;
  }
`;

export default AnalysisProposalContainer;
