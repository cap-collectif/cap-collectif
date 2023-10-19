// @ts-nocheck
import * as React from 'react'
import { m as motion } from 'framer-motion'
import { variant } from 'styled-system'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import AppBox from '~ui/Primitives/AppBox'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'

export type SkeletonTextProps = AppBoxProps & {
  animate?: boolean
  size?: 'sm' | 'md' | 'lg'
}
const SkeletonTextInner: StyledComponent<any, {}, any> = styled(motion(AppBox))(
  variant({
    variants: {
      sm: {
        height: 4,
      },
      md: {
        height: 5,
      },
      lg: {
        height: 6,
      },
    },
  }),
)

const SkeletonText = ({ size, animate = true, ...props }: SkeletonTextProps): JSX.Element => (
  <SkeletonTextInner
    animate={
      animate
        ? {
            opacity: 0.5,
          }
        : {}
    }
    transition={{
      duration: 1,
      repeatType: 'reverse',
      repeat: Infinity,
    }}
    bg="gray.150"
    borderRadius="placeholder"
    variant={size}
    {...props}
  />
)

SkeletonText.displayName = 'SkeletonText'
export default SkeletonText
