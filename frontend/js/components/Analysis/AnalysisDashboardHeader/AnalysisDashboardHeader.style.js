// @flow
import styled, { css, type StyledComponent } from 'styled-components';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import colors, { BsStyleColors } from '~/utils/colors';

const AnalystDashboardHeaderContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  color: ${colors.darkGray};

  & > div {
    margin-right: 25px;
  }

  svg {
    fill: ${colors.darkGray};
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

export default AnalystDashboardHeaderContainer;
