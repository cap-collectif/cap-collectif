// @flow
import * as React from 'react';
import { useKeyboardShortcuts } from '@liinkiing/react-hooks';
import { CollapsableContext } from './context';
import * as S from './index.styles';
import useClickAway from '~/utils/hooks/useClickAway';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

type ChildrenProps = {|
  +children?: React.Node,
  +disabled?: boolean,
|};

type CollapsableElementProps = {|
  ...ChildrenProps,
  +isAbsolute?: boolean,
  +ariaLabel?: string,
|};

type CollapsableButtonProps = {|
  ...ChildrenProps,
  +inline?: boolean,
  +showCaret?: boolean,
|};

const CollapsableButton = ({
  children,
  inline = false,
  showCaret = true,
}: CollapsableButtonProps) => {
  const { setVisible, visible, onClose, disabled } = React.useContext(CollapsableContext);
  const button = React.useRef<HTMLDivElement | null>(null);
  const toggleVisibility = React.useCallback(() => {
    if (disabled) return;

    setVisible(v => !v);
    if (onClose && visible) onClose();
  }, [setVisible, onClose, visible, disabled]);
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
      inline={inline}
      role="button"
      aria-haspopup="menu"
      tabIndex={0}
      visible={visible}
      onClick={toggleVisibility}>
      {children}
      {showCaret && <Icon name={ICON_NAME.arrowDown} size="0.6rem" />}
    </S.Button>
  );
};

const CollapsableElement = ({
  children,
  ariaLabel,
  isAbsolute = true,
}: CollapsableElementProps) => {
  const { visible } = React.useContext(CollapsableContext);
  return visible ? (
    <S.CollapsableBody
      className="body-collapse"
      isAbsolute={isAbsolute}
      role="menu"
      aria-label={ariaLabel || ''}>
      {children}
    </S.CollapsableBody>
  ) : null;
};

export type CollapsableAlignment = 'left' | 'right';

type Props = {|
  +align?: CollapsableAlignment,
  +closeOnClickAway?: boolean,
  +className?: string,
  +id?: string,
  +disabled?: boolean,
  +onClose?: () => void | Promise<any>,
  +children:
    | React.ChildrenArray<
        | React.Element<typeof React.Fragment | typeof CollapsableButton>
        | React.Element<typeof CollapsableElement>,
      >
    | ((render: { closeDropdown: () => void, visible: boolean }) => React.ChildrenArray<
        | React.Element<typeof React.Fragment | typeof CollapsableButton>
        | React.Element<typeof CollapsableElement>,
      >),
|};

const Collapsable = ({
  children,
  onClose,
  className,
  id,
  disabled,
  align = 'left',
  closeOnClickAway = true,
}: Props) => {
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
      disabled,
    }),
    [visible, setVisible, onClose, disabled],
  );
  const collapsable = React.useRef<HTMLDivElement | null>(null);
  useClickAway(
    collapsable,
    () => {
      if (onClose && visible) {
        onClose();
      }
      if (closeOnClickAway) {
        setVisible(false);
      }
    },
    [visible],
  );
  return (
    <CollapsableContext.Provider value={contextValue}>
      <S.Container
        ref={collapsable}
        align={align}
        className={className}
        id={id}
        disabled={disabled}>
        {typeof children === 'function' ? children({ closeDropdown, visible }) : children}
      </S.Container>
    </CollapsableContext.Provider>
  );
};

Collapsable.Element = CollapsableElement;
Collapsable.Button = CollapsableButton;

export default Collapsable;
