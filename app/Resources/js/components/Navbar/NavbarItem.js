// @flow
import React from 'react';
import { NavDropdown, MenuItem, NavItem } from 'react-bootstrap';
import { injectIntl, type IntlShape } from 'react-intl';

type Props = {
  intl: IntlShape,
  item: Object,
  isChild?: boolean,
  refCallback?: Function,
  className?: string,
  onKeyDown?: Function,
};

class NavbarItem extends React.Component<Props> {
  static defaultProps = {
    isChild: false,
    refCallback: () => {},
    className: '',
    onKeyDown: () => {},
  };

  render() {
    const { item, isChild, refCallback, className, onKeyDown, intl } = this.props;

    const title = `${item.title} - ${intl.formatMessage({ id: 'active.page' })}`;

    if (item.hasEnabledFeature) {
      if (item.children && item.children.length > 0) {
        if (isChild) {
          return (
            <span className="nav-dropdown-section">
              <MenuItem
                ref={refCallback}
                header
                key={item.id}
                className={className}
                onKeyDown={onKeyDown}>
                {item.title}
              </MenuItem>
              {item.children.map(child => (
                <NavbarItem intl={intl} item={child} key={child.id} isChild onKeyDown={onKeyDown} />
              ))}
            </span>
          );
        }
        return (
          <NavDropdown
            id={`navbar-dropdown-${item.id}`}
            ref={refCallback}
            title={item.title}
            className={className}
            onKeyDown={onKeyDown}>
            {item.children.map((child, childIndex) => (
              <NavbarItem intl={intl} item={child} isChild key={childIndex} onKeyDown={onKeyDown} />
            ))}
          </NavDropdown>
        );
      }
      if (isChild) {
        return (
          <MenuItem
            href={item.link}
            active={item.active}
            title={item.active ? title : null}
            ref={refCallback}
            className={className}
            onKeyDown={onKeyDown}>
            {item.title}
          </MenuItem>
        );
      }
      return (
        <NavItem
          href={item.link}
          active={item.active}
          title={item.active ? title : null}
          ref={refCallback}
          className={className}
          onKeyDown={onKeyDown}>
          {item.title}
        </NavItem>
      );
    }
    return null;
  }
}

export default injectIntl(NavbarItem);
