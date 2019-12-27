// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { mediaQueryMobile } from '~/utils/sizes';
import { spaceItemPosition } from '~/components/Ui/DragnDrop/List/List.style';

const RankingListContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'rankingList',
})`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .separator {
    margin-top: 90px; /* (height separator + height wrapper-item-container (empty) ) / 2 */
    font-size: 24px;
    color: ${colors.lightGray};
  }

  @media (max-width: ${mediaQueryMobile}) {
    .list-dragndrop:first-child {
      padding-left: ${spaceItemPosition}px;
    }
  }
`;

export default RankingListContainer;
