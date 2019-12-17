// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

const RankingListContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'rankingList',
})`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .separator {
    align-self: center;
    font-size: 24px;
    color: ${colors.lightGray};
  }
`;

export default RankingListContainer;
