// @flow
import styled, { type StyledComponent } from 'styled-components';
import { Label as BSLabel } from 'react-bootstrap';
import DropdownSelect from '~ui/DropdownSelect';
import colors from '~/utils/colors';

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

export const ProposalVotableStep: StyledComponent<{}, {}, HTMLSpanElement> = styled.span`
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  margin: 0;
  padding: 0;
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

export const EmptyStatuses: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;

  span {
    font-weight: normal;
  }

  .icon {
    width: auto;
    padding: 0;
    margin-right: 8px;
    margin-top: 2px;
  }
`;

export const MergeButton: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  padding: 0;
  margin: 0;
  background: none;
  border: none;
`;

export const Divider: StyledComponent<{}, {}, HTMLSpanElement> = styled.span`
  width: 1px;
  height: 20px;
  background-color: ${colors.darkGray};
`;
