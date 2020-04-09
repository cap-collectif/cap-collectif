// @flow
import styled, { type StyledComponent } from 'styled-components';
import { Label as BSLabel } from 'react-bootstrap';
import PickableList from '~ui/List/PickableList';
import DropdownSelect from '~ui/DropdownSelect';

export const ProjectAdminProposalsHeader: StyledComponent<{}, {}, HTMLElement> = styled.header`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  & .clearable-input {
    margin-left: auto;
    width: 250px;
  }
`;

export const ProposalListDropdownChoice: StyledComponent<
  {},
  {},
  typeof DropdownSelect.Choice,
> = styled(DropdownSelect.Choice)`
  & span:first-of-type {
    padding-left: 0;
    & > span {
      padding-left: 24px;
    }
    & svg + span {
      padding-left: 0;
    }
  }
`;

export const ProposalListRow: StyledComponent<{}, {}, typeof PickableList.Row> = styled(
  PickableList.Row,
)`
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

export const Label: StyledComponent<{}, {}, typeof BSLabel> = styled(BSLabel)`
  border-radius: 12px;
  padding: 6px;
`;

export const EmptyStatusesFilling: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  padding: 15px;

  span {
    font-weight: normal;
  }

  .icon {
    margin-right: 8px;
    margin-top: 2px;
  }
`;
