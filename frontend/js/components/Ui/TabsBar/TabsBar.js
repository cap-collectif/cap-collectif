// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';

import TabsItem from './TabsItem';
import TabsBarDropdown from './TabsBarDropdown';

import * as S from './styles';
import useShowMore from '../../../utils/hooks/useShowMore';

type Props = {|
  items: Array<Object>,
  vertical?: boolean,
|};

const TabsBar = ({ items, vertical }: Props) => {
  const intl = useIntl();
  const [
    containerRef,
    seeMoreRef,
    handleItemWidth,
    overflowIndex,
    shouldDisplaySeeMore,
  ] = useShowMore(!vertical, items.length);

  const renderSeeMore = () => {
    const overflowedItems = items.filter((item, index) => index >= overflowIndex);
    const seeMoreItem = {
      title: intl.formatMessage({ id: 'global.navbar.see_more' }),
      children: overflowedItems,
    };

    return (
      // $FlowFixMe ref on a styled component
      <S.TabsItemContainer vertical={vertical} ref={seeMoreRef}>
        <TabsBarDropdown
          item={seeMoreItem}
          id="tabsbar-dropdown-see-more"
          toggleElement={intl.formatMessage({ id: 'global.navbar.see_more' })}
          intl={intl}
        />
      </S.TabsItemContainer>
    );
  };

  return (
    // $FlowFixMe ref on a styled component
    <S.TabsBarContainer show vertical={vertical} ref={containerRef}>
      {items.map((item, index) => {
        return index < overflowIndex ? (
          <S.TabsItemContainer
            key={index}
            vertical={vertical}
            ref={handleItemWidth}
            className="tabsbar-item-wrapper">
            <TabsItem key={index} item={item} intl={intl} vertical={vertical} />
          </S.TabsItemContainer>
        ) : null;
      })}
      {shouldDisplaySeeMore && renderSeeMore()}
    </S.TabsBarContainer>
  );
};
TabsBar.defaultProps = {
  vertical: false,
};

export default TabsBar;
