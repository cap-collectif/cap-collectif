// @ts-nocheck
import * as React from 'react'
import styled from 'styled-components'
import { AnimatePresence, m as motion } from 'framer-motion'
import { LAYOUT_TRANSITION_SPRING } from '~/utils/motion'
import SkeletonText from '~ds/Skeleton/text'
import SkeletonCircle from '~ds/Skeleton/circle'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'
import AppBox from '~ui/Primitives/AppBox'
export type SkeletonProps = AppBoxProps & {
  readonly isLoaded: boolean | null | undefined
  readonly children: JSX.Element | JSX.Element[] | string
  readonly placeholder: JSX.Element | JSX.Element[] | string
  readonly animate?: boolean
}
const SkeletonInner = styled(motion(AppBox))``

const Skeleton = ({ isLoaded = false, children, placeholder, ...rest }: SkeletonProps): JSX.Element => (
  <AnimatePresence>
    {isLoaded ? (
      <SkeletonInner
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={LAYOUT_TRANSITION_SPRING}
        exit={{
          opacity: 0,
        }}
        {...rest}
      >
        {children}
      </SkeletonInner>
    ) : (
      placeholder
    )}
  </AnimatePresence>
)

Skeleton.Text = SkeletonText
Skeleton.Circle = SkeletonCircle
export default Skeleton
