import * as React from 'react'
import { useIntl } from 'react-intl'
import TabsItem from './TabsItem'
import TabsBarDropdown from './TabsBarDropdown'
import * as S from './styles'
import useShowMore from '~/utils/hooks/useShowMore'
import useIsMobile from '~/utils/hooks/useIsMobile'
import type { Item } from '~/components/Navbar/Navbar.type'

type Props = {
  items: Item[]
}

const TabsBar = ({ items }: Props) => {
  const intl = useIntl()
  const isMobile = useIsMobile()
  const [containerRef, seeMoreRef, handleItemWidth, overflowIndex, shouldDisplaySeeMore] = useShowMore(
    !isMobile,
    items.length,
  )

  const renderSeeMore = () => {
    const overflowedItems = items.filter((item, index) => index >= overflowIndex)
    const seeMoreItem = {
      id: 'see-more',
      title: intl.formatMessage({
        id: 'global.navbar.see_more',
      }),
      children: overflowedItems,
    }
    return (
      <S.TabsItemContainer ref={seeMoreRef}>
        <TabsBarDropdown item={seeMoreItem} />
      </S.TabsItemContainer>
    )
  }

  return (
    <S.TabsBarContainer ref={containerRef}>
      {items.map((item, index) => {
        return index < overflowIndex ? (
          <S.TabsItemContainer key={index} ref={handleItemWidth} className="tabsbar-item-wrapper">
            <TabsItem item={item} />
          </S.TabsItemContainer>
        ) : null
      })}
      {shouldDisplaySeeMore && renderSeeMore()}
    </S.TabsBarContainer>
  )
}

export default TabsBar
