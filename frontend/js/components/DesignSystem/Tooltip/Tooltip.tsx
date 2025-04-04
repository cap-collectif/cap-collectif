// @ts-nocheck
import cn from 'classnames'
import { m as motion, AnimatePresence } from 'framer-motion'
import * as React from 'react'
import { Tooltip as ReakitTooltip, TooltipReference, TooltipArrow, useTooltipState } from 'reakit/Tooltip'
import styled from 'styled-components'
import AppBox from '~ui/Primitives/AppBox'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'
import { colors } from '~/styles/modules/colors'
import { LAYOUT_TRANSITION_SPRING } from '~/utils/motion'
import Text from '~ui/Primitives/Text'
import type { TippyPlacementProps } from '~ds/common.type'
type TooltipProps = AppBoxProps &
  TippyPlacementProps & {
    readonly children: JSX.Element | JSX.Element[] | string
    readonly visible?: boolean
    readonly label?: JSX.Element | JSX.Element[] | string
    readonly baseId?: string
    readonly zIndex?: number
  }
const ContainerAnimate = motion(AppBox)
const Arrow = styled(TooltipArrow)`
  svg {
    transform: rotateZ(180deg) scale(1.1) !important;
  }
  .stroke {
    fill: transparent;
  }

  .fill {
    fill: ${colors.gray['900']};
  }
`
export const Tooltip = ({
  children,
  label,
  visible,
  className,
  baseId,
  zIndex = 1100,
  ...props
}: TooltipProps): JSX.Element => {
  const tooltip = useTooltipState({
    visible,
    animated: 300,
    gutter: 8,
    baseId,
    unstable_timeout: 400,
  })
  if (!label) return (children as unknown as JSX.Element) || null
  return (
    <>
      <TooltipReference
        {...tooltip}
        ref={React.Children.toArray(children)[0].ref}
        {...React.Children.toArray(children)[0].props}
      >
        {referenceProps => React.cloneElement(React.Children.toArray(children)[0], referenceProps)}
      </TooltipReference>

      <ReakitTooltip
        {...tooltip}
        className="cap-tooltip"
        unstable_popoverStyles={{ ...tooltip.unstable_popoverStyles, zIndex }}
      >
        <AnimatePresence>
          {tooltip.visible && (
            <ContainerAnimate
              p={1}
              bg="gray.900"
              color="white"
              borderRadius="tooltip"
              maxWidth="270px"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={LAYOUT_TRANSITION_SPRING}
              className={cn('cap-tooltip', className)}
              {...props}
            >
              <Arrow {...tooltip} />
              {typeof label === 'string' && (
                <Text textAlign="center" lineHeight="sm" fontSize="11px">
                  {label}
                </Text>
              )}
              {typeof label !== 'string' && label}
            </ContainerAnimate>
          )}
        </AnimatePresence>
      </ReakitTooltip>
    </>
  )
}
Tooltip.displayName = 'Tooltip'
export default Tooltip
