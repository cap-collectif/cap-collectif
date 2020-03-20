// @flow
import styled, { css, type StyledComponent } from 'styled-components';
import { Label as BSLabel } from 'react-bootstrap';
import PickableList from '~ui/List/PickableList';
import colors, { BsStyleColors } from '~/utils/colors';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';

export const ProposalPickableListContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin: 0 2rem 2rem 2rem;
`;

export const ProjectAdminProposalsHeader: StyledComponent<{}, {}, HTMLElement> = styled.header`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  & .clearable-input {
    margin-left: auto;
    width: 250px;
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

export const Label: StyledComponent<{}, {}, typeof BSLabel> = styled(BSLabel)`
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
  background: ${colors.white};
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

export const FilterContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export const FilterTagContainer: StyledComponent<
  { bgColor?: string },
  {},
  HTMLDivElement,
> = styled.div`
  ${MAIN_BORDER_RADIUS};
  margin-top: 0.75rem;
  font-weight: 600;
  font-size: 1.2rem;
  height: 22px;
  display: flex;
  color: ${colors.white};
  padding: 0.25rem 0.75rem;
  align-items: baseline;
  ${props =>
    props.bgColor
      ? css`
          background: ${BsStyleColors[props.bgColor] || colors.primaryColor};
        `
      : css`
          background: ${colors.darkGray};
        `}
  & > span {
    max-width: 120px;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-height: 16px;
    overflow: hidden;
  }
  & > svg.close-icon {
    color: inherit;
    margin-left: 6px;
    &:hover {
      cursor: pointer;
    }
  }
`;
