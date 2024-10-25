// @ts-nocheck
import { $PropertyType } from 'utility-types'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { m as motion } from 'framer-motion'
import { variant as styledVariant } from 'styled-system'
import { fadeOut, slideInDown, slideInLeftToRight, slideInRightToLeft, slideInUp } from '~/utils/styles/keyframes'
import Text from '~ui/Primitives/Text'
import AppBox from '~ui/Primitives/AppBox'
import jsxInnerText from '~/utils/jsxInnerText'
import useTimeout from '@shared/hooks/useTimeout'
import type { Props as IconProps } from '~ds/Icon/Icon'
import Icon, { ICON_NAME } from '~ds/Icon/Icon'
import colors from '~/styles/modules/colors'
import Flex from '~ui/Primitives/Layout/Flex'
import { boxShadow } from '~/styles/theme/base'
import Spinner from '~ds/Spinner/Spinner'
export type ToastProps = {
  readonly position?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right'
  readonly id: string
  readonly variant: 'info' | 'success' | 'danger' | 'warning' | 'loading'
  readonly closable?: boolean
  readonly duration?: number
  readonly content: JSX.Element | JSX.Element[] | string
  readonly onClose?: () => void
}
type Props = ToastProps & {
  readonly onHide?: (id: string) => void
}
const MIN_TIMEOUT = 1500
// styled-component is wrongly type for styled-system,
// then we have an error when we use it with this one
const ToastInner = styled(motion(AppBox)).attrs({
  m: 2,
  p: 4,
  pr: 5,
  borderRadius: 'toasts',
  bg: 'white',
})`
  animation: ${props => props.animation} 0.23s forwards ease-in-out;
  pointer-events: all;
  position: relative;

  & > p {
    margin: 0;
  }

  & a {
    color: inherit;
    text-decoration: underline;
  }

  ${styledVariant({
    variants: {
      danger: {
        color: 'red.900',
        bg: 'red.100',
        boxShadow: `0 -5px 0 ${colors.red[300]}, ${boxShadow.medium}`,
      },
      info: {
        color: 'blue.900',
        bg: 'blue.100',
        boxShadow: `0 -5px 0 ${colors.blue[300]}, ${boxShadow.medium}`,
      },
      loading: {
        color: 'blue.800',
        bg: 'blue.100',
        boxShadow: `0 -5px 0 ${colors.blue[300]}, ${boxShadow.medium}`,
      },
      success: {
        color: 'green.900',
        bg: 'green.100',
        boxShadow: `0 -5px 0 ${colors.green[300]}, ${boxShadow.medium}`,
      },
      warning: {
        color: 'yellow.900',
        bg: 'yellow.100',
        boxShadow: `0 -5px 0 ${colors.yellow[300]}, ${boxShadow.medium}`,
      },
    },
  })};
`

const getIcon = (variant: $PropertyType<ToastProps, 'variant'>, props?: IconProps): JSX.Element => {
  const common: {
    size: 'md'
  } = {
    size: 'md',
  }

  switch (variant) {
    case 'info':
      return <Icon name={ICON_NAME.CIRCLE_INFO} color="blue.500" {...common} {...props} />

    case 'success':
      return <Icon name={ICON_NAME.CIRCLE_CHECK} color="green.500" {...common} {...props} />

    case 'danger':
      return <Icon name={ICON_NAME.CIRCLE_CROSS} color="red.500" {...common} {...props} />

    case 'warning':
      return <Icon name={ICON_NAME.CIRCLE_ALERT} color="yellow.500" {...common} {...props} />

    default:
      throw new Error('Unsupported icon variant!')
  }
}

const getAnimation = (position: $PropertyType<ToastProps, 'position'>) => {
  switch (position) {
    case 'top':
    default:
      return slideInUp

    case 'bottom':
      return slideInDown

    case 'top-left':
    case 'bottom-left':
      return slideInRightToLeft

    case 'top-right':
    case 'bottom-right':
      return slideInLeftToRight
  }
}

export const Toast = ({
  content,
  id,
  onHide,
  onClose,
  duration = jsxInnerText(content) !== '' ? jsxInnerText(content).length * 100 : MIN_TIMEOUT,
  closable = false,
  position,
  ...props
}: Props) => {
  const [show, setShow] = useState(true)
  const container = useRef<HTMLDivElement | null | undefined>()
  const clearTimeout = useTimeout(
    () => {
      if (duration && duration > 0) {
        setShow(false)
      }
    },
    duration < MIN_TIMEOUT ? MIN_TIMEOUT : duration,
    [],
  )
  useEffect(() => {
    const $container = container.current

    const endHandler = (evt: AnimationEvent) => {
      if (evt.animationName === fadeOut.getName()) {
        if (onClose) {
          onClose()
        }

        if (onHide) {
          onHide(id)
        }
      }
    }

    if ($container) {
      $container.addEventListener('animationend', endHandler)
    }

    return () => {
      if ($container) {
        $container.removeEventListener('animationend', endHandler)
      }
    }
  }, [onClose, onHide, id])
  const { variant } = props
  return (
    <ToastInner {...props} id={id} ref={container} animation={show ? getAnimation(position) : fadeOut}>
      <Flex
        align="center"
        css={{
          '& > *:last-child': {
            flex: 1,
          },
        }}
      >
        {variant === 'loading' ? (
          <Spinner mr={2} />
        ) : (
          getIcon(variant, {
            mr: 2,
          })
        )}
        {typeof content === 'string' ? (
          <Text
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          />
        ) : (
          content
        )}
      </Flex>
      {closable && (
        <Icon
          name={ICON_NAME.CROSS}
          position="absolute"
          size="1.5rem"
          top="0px"
          right="0px"
          onClick={() => {
            // TODO(@liinkiing): change when we have a design for a closable notification
            clearTimeout()
            setShow(false)
          }}
        />
      )}
    </ToastInner>
  )
}
export default Toast
