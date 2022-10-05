// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import cn from 'classnames';
import TabsBarDropdown from './TabsBarDropdown';
import * as S from './styles';
import type { Item } from '~/components/Navbar/Navbar.type';

type Props = {|
  item: Item,
|};

const TabsItem = ({ item }: Props) => {
  const intl = useIntl();
  const ariaTitle = `${item.title} - ${intl.formatMessage({ id: 'active.page' })}`;

  if (item.hasEnabledFeature) {
    if (item.children && item.children.length > 0) {
      return <TabsBarDropdown item={item} />;
    }

    return item.link ? (
      <S.TabsLink
        id={`tabs-navbar-link-${item.id}`}
        href={item.link}
        active={item.active}
        className={cn({ 'tabs-navbar-link-active': item.active })}
        title={item.active ? ariaTitle : null}>
        {item.title}
      </S.TabsLink>
    ) : (
      <S.TabsParent id={`tabs-navbar-parent-${item.id}`}>{item.title}</S.TabsParent>
    );
  }

  return null;
};

export default TabsItem;
