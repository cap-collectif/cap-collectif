// @ts-nocheck
import * as React from 'react'
import { m as motion } from 'framer-motion'
import AppBox from '~ui/Primitives/AppBox'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'

const SkeletonCircleInner = motion(AppBox)
export type SkeletonCircleProps = AppBoxProps & {
  animate?: boolean
  size: number | string
}

const SkeletonCircle = ({ size, animate = true, ...props }: SkeletonCircleProps): JSX.Element => (
  <SkeletonCircleInner
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
    width={size}
    height={size}
    borderRadius="100%"
    {...props}
  />
)

SkeletonCircle.displayName = 'SkeletonCircle'
export default SkeletonCircle
