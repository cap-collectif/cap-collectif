// @flow
import * as React from 'react';
import { type IntlShape } from 'react-intl';

import TabsBarDropdown from './TabsBarDropdown';

import * as S from './styles';

type Props = {
  intl: IntlShape,
  item: Object,
  vertical: boolean,
};

class TabsItem extends React.PureComponent<Props> {
  render() {
    const { item, intl, vertical } = this.props;
    const ariaTitle = `${item.title} - ${intl.formatMessage({ id: 'active.page' })}`;

    if (item.hasEnabledFeature) {
      if (item.children && item.children.length > 0) {
        return (
          <TabsBarDropdown
            intl={intl}
            item={item}
            toggleElement={item.title}
            id={`tabsbar-item-${item.id}`}
            vertical={vertical}
          />
        );
      }

      return (
        <S.TabsLink href={item.link} active={item.active} title={item.active ? ariaTitle : null}>
          {item.title}
        </S.TabsLink>
      );
    }

    return null;
  }
}

export default TabsItem;
