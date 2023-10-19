import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import colors from '~/utils/colors'
import { mediaQueryMobile, bootstrapGrid } from '~/utils/sizes'
import { spaceItemPosition } from '~/components/Ui/DragnDrop/List/List.style'

const RankingListContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div.attrs({
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

  @media (max-width: ${bootstrapGrid.mdMax}px) {
    .list-dragndrop {
      width: 48%;

      .list__item {
        width: 100%;
      }
    }

    .separator {
      display: none;
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .list-dragndrop {
      width: auto;
    }

    .list-dragndrop:first-child {
      padding-left: ${spaceItemPosition}px;
    }
  }
`
export default RankingListContainer
