// @flow
import React from 'react';
import { NavDropdown, MenuItem, NavItem } from 'react-bootstrap';

type Props = {
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
    const { item, isChild, refCallback, className, onKeyDown } = this.props;
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
                <NavbarItem item={child} key={child.id} isChild onKeyDown={onKeyDown} />
              ))}
            </span>
          );
        }
        return (
          <NavDropdown
            id={`navbar-dropdown-${item.id}`}
            title={item.title}
            ref={refCallback}
            className={className}
            onKeyDown={onKeyDown}>
            {item.children.map((child, childIndex) => (
              <NavbarItem item={child} isChild key={childIndex} onKeyDown={onKeyDown} />
            ))}
          </NavDropdown>
        );
      }
      if (isChild) {
        return (
          <MenuItem
            href={item.link}
            active={item.active}
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

export default NavbarItem;
