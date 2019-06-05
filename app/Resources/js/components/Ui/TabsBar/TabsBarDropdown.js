/* @flow */
import React, { useState } from 'react';
import { type IntlShape } from 'react-intl';

import * as S from './styles';

type Props = {
  intl: IntlShape,
  item?: Object,
  vertical?: boolean,
  pullRight?: boolean,
  id?: number | string,
  toggleElement?: any,
  children?: any,
};

const TabsBarDropdown = (props: Props) => {
  const { intl, item, vertical, pullRight, id, toggleElement, children } = props;
  const [open, setOpen] = useState(false);

  return (
    <S.Dropdown>
      <S.DropdownToggle
        type="button"
        className="btn btn-md btn-link" /* Bootstrap class to remove later */
        id={id}
        vertical={vertical}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onBlur={() => setOpen(false)}>
        {toggleElement}
        <span className="caret" />
      </S.DropdownToggle>
      <S.DropdownMenu
        role="menu"
        aria-labelledby={id}
        show={open}
        vertical={vertical}
        pullRight={pullRight}>
        {children &&
          children.map((child, index) => (
            <li role="presentation" key={index}>
              {child}
            </li>
          ))}
        {!children &&
          item &&
          item.children &&
          item.children.length > 0 &&
          item.children.map((child, childIndex) => (
            <li role="presentation" key={childIndex}>
              {/* Item inside dropdown can have children */}
              {child.children && child.children.length > 0 ? (
                <S.DropdownSection>
                  <S.DropdownSectionTitle>{child.title}</S.DropdownSectionTitle>
                  {child.children.map((subChild, subChildIndex) => (
                    <S.TabsLink
                      key={subChildIndex}
                      href={subChild.link}
                      active={subChild.active}
                      title={
                        subChild.active
                          ? `${subChild.title} - ${intl.formatMessage({ id: 'active.page' })}`
                          : null
                      }
                      role="menuitem"
                      tabIndex="-1">
                      {subChild.title}
                    </S.TabsLink>
                  ))}
                </S.DropdownSection>
              ) : (
                <S.TabsLink
                  href={child.link}
                  active={child.active}
                  title={
                    child.active
                      ? `${child.title} - ${intl.formatMessage({ id: 'active.page' })}`
                      : null
                  }
                  role="menuitem"
                  tabIndex="-1">
                  {child.title}
                </S.TabsLink>
              )}
            </li>
          ))}
      </S.DropdownMenu>
    </S.Dropdown>
  );
};

export default TabsBarDropdown;
