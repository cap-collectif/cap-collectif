// @flow
import * as React from 'react';
import { useKeyboardShortcuts } from '@liinkiing/react-hooks';
import { CollapsableContext } from './context';
import * as S from './index.styles';
import useClickAway from '~/utils/hooks/useClickAway';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

type ChildrenProps = {|
  +children: React.Node,
|};

type CollapsableElementProps = {|
  ...ChildrenProps,
  +ariaLabel?: string,
|};

const CollapsableButton = ({ children }: ChildrenProps) => {
  const { setVisible, visible, onClose } = React.useContext(CollapsableContext);
  const button = React.useRef<HTMLDivElement | null>(null);
  const toggleVisibility = React.useCallback(() => {
    setVisible(v => !v);
    if (onClose && visible) onClose();
  }, [setVisible, onClose, visible]);
  useKeyboardShortcuts(
    [
      {
        preventDefault: true,
        keys: ['Space', 'Enter'],
        action() {
          toggleVisibility();
        },
      },
    ],
    button,
  );
  return (
    <S.Button
      ref={button}
      role="button"
      aria-haspopup="menu"
      tabIndex={0}
      visible={visible}
      onClick={toggleVisibility}>
      {children}
      <Icon name={ICON_NAME.arrowDown} size="0.6rem" />
    </S.Button>
  );
};

const CollapsableElement = ({ children, ariaLabel }: CollapsableElementProps) => {
  const { visible } = React.useContext(CollapsableContext);
  return visible ? (
    <S.CollapsableBody role="menu" aria-label={ariaLabel || ''}>
      {children}
    </S.CollapsableBody>
  ) : null;
};

export type CollapsableAlignment = 'left' | 'right';

type Props = {|
  +align?: CollapsableAlignment,
  +onClose?: () => void | Promise<any>,
  +children:
    | React.ChildrenArray<
        | React.Element<typeof React.Fragment | typeof CollapsableButton>
        | React.Element<typeof CollapsableElement>,
      >
    | ((
        closeDropdown: () => void,
      ) => React.ChildrenArray<
        | React.Element<typeof React.Fragment | typeof CollapsableButton>
        | React.Element<typeof CollapsableElement>,
      >),
|};

const Collapsable = ({ children, onClose, align = 'left' }: Props) => {
  const [visible, setVisible] = React.useState(false);
  const closeDropdown = () => {
    if (onClose) {
      onClose();
    }
    setVisible(false);
  };
  const contextValue = React.useMemo(
    () => ({
      visible,
      setVisible,
      onClose,
    }),
    [visible, setVisible, onClose],
  );
  const collapsable = React.useRef<HTMLDivElement | null>(null);
  useClickAway(
    collapsable,
    () => {
      if (onClose && visible) {
        onClose();
      }
      setVisible(false);
    },
    [visible],
  );
  return (
    <CollapsableContext.Provider value={contextValue}>
      <S.Container ref={collapsable} align={align}>
        {typeof children === 'function' ? children(closeDropdown) : children}
      </S.Container>
    </CollapsableContext.Provider>
  );
};

Collapsable.Element = CollapsableElement;
Collapsable.Button = CollapsableButton;

export default Collapsable;
