import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

type Props = {
  synthesis: Object,
};

class TopMenu extends React.Component<Props> {
  getMenuItems = () => {
    return [
      {
        link: '/inbox/new',
        color: 'blue',
        icon: 'cap-download-6',
        label: 'inbox',
      },
      {
        link: '/inbox/archived',
        color: 'orange',
        icon: 'cap-check-4',
        label: 'archived',
      },
      {
        link: '/inbox/published',
        color: 'green',
        icon: 'cap-tag-1',
        label: 'published',
      },
      {
        link: '/inbox/unpublished',
        color: 'gray',
        icon: 'cap-delete-2',
        label: 'unpublished',
      },
      {
        link: '/inbox/all',
        color: 'black',
        icon: 'cap-baloon',
        label: 'all',
      },
    ];
  };

  renderMenuItem = (item, index) => {
    const menuItemClass = `menu__item menu__item--${item.color}`;
    const menuItemId = `menu-item-${item.label}`;
    const iconClass = `icon--${item.color}`;
    return (
      <LinkContainer to={item.link} key={index}>
        <NavItem className={menuItemClass} id={menuItemId}>
          <i style={{ fontSize: '25px' }} className={`cap ${item.icon} ${iconClass}`} />{' '}
          <span className="hidden-sm">
            <FormattedMessage id={`synthesis.edition.topMenu.${item.label}`} />
          </span>
        </NavItem>
      </LinkContainer>
    );
  };

  render() {
    const items = this.getMenuItems();
    return (
      <Nav bsStyle="tabs" justified className="synthesis__top-menu">
        {items.map((item, index) => {
          return this.renderMenuItem(item, index);
        })}
      </Nav>
    );
  }
}

export default TopMenu;
