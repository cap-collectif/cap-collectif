/* @flow */
import * as React from 'react';
import { type IntlShape } from 'react-intl';

import * as S from './styles';

type Props = {|
  intl: IntlShape,
  item?: Object,
  vertical?: boolean,
  pullRight?: boolean,
  id?: number | string,
  toggleElement?: React.Node,
  eventKey?: number | string,
  'aria-label'?: string,
  children?: ?React.ChildrenArray<null | React.Element<typeof S.TabsLink> | React.Element<typeof S.TabsDivider>>,
|};


const TabsBarDropdown = (props: Props) => {
  const { intl, item, vertical, pullRight, id, toggleElement, children } = props;
  const node = React.useRef();
  const [open, setOpen] = React.useState(false);

  const handleClickOutside = (e: MouseEvent) => {
    // Detect if click is inside container (do nothing)
    if (node && node.current && node.current.contains(e.target)) {
      return;
    }

    setOpen(false);
  };

  const handleTabPress = (e: KeyboardEvent) => {
    if ((e.which || e.keyCode) === 9) {
      setOpen(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleTabPress);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleTabPress);
    };
  }, [open]);

  return (
    <S.Dropdown ref={node}>
      <S.DropdownToggle
        type="button"
        className="btn-link" /* TODO: Bootstrap class to remove later */
        id={id}
        vertical={vertical}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(!open)}>
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
          Array.isArray(children) &&
          children.map((child, index) => (
            <li role="presentation" key={index} onClick={() => setOpen(false)}>
              {child}
            </li>
          ))}
        {!children &&
          item &&
          item.children &&
          item.children.length > 0 &&
          item.children.map((child, childIndex) => (
            <li role="presentation" key={childIndex} onClick={() => setOpen(false)}>
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

TabsBarDropdown.defaultProps = {
  vertical: false,
  pullRight: false,
};

export default TabsBarDropdown;
