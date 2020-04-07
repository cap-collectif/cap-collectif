// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

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

export default AnalystDashboardHeaderContainer;
