import * as React from 'react'
import { useKeyboardShortcuts } from '@liinkiing/react-hooks'
import { CollapsableContext } from './context'
import * as S from './index.styles'
import useClickAway from '~/utils/hooks/useClickAway'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
type ChildrenProps = {
  readonly children?: JSX.Element | JSX.Element[] | string
  readonly disabled?: boolean
}
type CollapsableElementProps = ChildrenProps & {
  readonly isAbsolute?: boolean
  readonly ariaLabel?: string
}
type CollapsableButtonProps = ChildrenProps & {
  readonly inline?: boolean
  readonly showCaret?: boolean
}

const CollapsableButton = ({ children, inline = false, showCaret = true }: CollapsableButtonProps) => {
  const { setVisible, visible, onClose, disabled } = React.useContext(CollapsableContext)
  const button = React.useRef<HTMLDivElement | null>(null)
  const toggleVisibility = React.useCallback(() => {
    if (disabled) return
    setVisible(v => !v)
    if (onClose && visible) onClose()
  }, [setVisible, onClose, visible, disabled])
  useKeyboardShortcuts(
    [
      {
        preventDefault: true,
        keys: ['Space', 'Enter'],

        action() {
          toggleVisibility()
        },
      },
    ],
    button,
  )
  return (
    <S.Button
      ref={button}
      inline={inline}
      role="button"
      aria-haspopup="menu"
      tabIndex={0}
      visible={visible}
      onClick={toggleVisibility}
    >
      {children}
      {showCaret && <Icon name={ICON_NAME.arrowDown} size="0.6rem" />}
    </S.Button>
  )
}

const CollapsableElement = ({ children, ariaLabel, isAbsolute = true }: CollapsableElementProps) => {
  const { visible } = React.useContext(CollapsableContext)
  return visible ? (
    <S.CollapsableBody className="body-collapse" isAbsolute={isAbsolute} role="menu" aria-label={ariaLabel || ''}>
      {children}
    </S.CollapsableBody>
  ) : null
}

export type CollapsableAlignment = 'left' | 'right'
type Props = {
  readonly align?: CollapsableAlignment
  readonly closeOnClickAway?: boolean
  readonly className?: string
  readonly id?: string
  readonly disabled?: boolean
  readonly onClose?: () => void | Promise<any>
  readonly children:
    | React.ChildrenArray<
        | React.ReactElement<typeof React.ReactFragment | typeof CollapsableButton>
        | React.ReactElement<typeof CollapsableElement>
      >
    | ((render: {
        closeDropdown: () => void
        visible: boolean
      }) => React.ChildrenArray<
        | React.ReactElement<typeof React.ReactFragment | typeof CollapsableButton>
        | React.ReactElement<typeof CollapsableElement>
      >)
}

const Collapsable = ({
  children,
  onClose,
  className,
  id,
  disabled,
  align = 'left',
  closeOnClickAway = true,
}: Props) => {
  const [visible, setVisible] = React.useState(false)

  const closeDropdown = () => {
    if (onClose) {
      onClose()
    }

    setVisible(false)
  }

  const contextValue = React.useMemo(
    () => ({
      visible,
      setVisible,
      onClose,
      disabled,
    }),
    [visible, setVisible, onClose, disabled],
  )
  const collapsable = React.useRef<HTMLDivElement | null>(null)
  useClickAway(
    collapsable,
    () => {
      if (onClose && visible) {
        onClose()
      }

      if (closeOnClickAway) {
        setVisible(false)
      }
    },
    [visible],
  )
  return (
    <CollapsableContext.Provider value={contextValue}>
      <S.Container ref={collapsable} align={align} className={className} id={id} disabled={disabled}>
        {typeof children === 'function'
          ? children({
              closeDropdown,
              visible,
            })
          : children}
      </S.Container>
    </CollapsableContext.Provider>
  )
}

Collapsable.Element = CollapsableElement
Collapsable.Button = CollapsableButton
export default Collapsable
