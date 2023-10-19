// @ts-nocheck
import * as React from 'react'
import { AnimatePresence, m as motion } from 'framer-motion'
import type { Props as ModalBodyProps } from '~ds/Modal/ModalBody'
import ModalBody from '~ds/Modal/ModalBody'
import { useModalSteps } from '~ds/ModalSteps/ModalSteps.context'
import type { Step } from '~ds/ModalSteps/ModalSteps.context'
import AppBox from '~ui/Primitives/AppBox'
type Direction = 'LEFT' | 'RIGHT'
type Props = ModalBodyProps & {
  readonly children: JSX.Element | JSX.Element[]
}
const variants = {
  enter: (direction: Direction) => ({
    x: direction === 'LEFT' ? '-50%' : '50%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: Direction) => ({
    x: direction === 'LEFT' ? '20%' : '-20%',
    opacity: 0,
  }),
}
const Content = motion(AppBox)

const ModalStepsBody = ({ children, ...rest }: Props) => {
  const { currentStep, steps, registerSteps } = useModalSteps()
  const previousModalIndex = React.useRef(currentStep)
  React.useEffect(() => {
    if (steps.length === 0) {
      const stepsRegistered: Step[] = React.Children.toArray(children).map(modal => ({
        id: modal.props.id,
        label: modal.props.label,
        validationLabel: modal.props?.validationLabel,
        infoUrl: modal.props?.infoUrl,
      }))
      registerSteps(stepsRegistered)
    }
  }, [children, registerSteps, steps])
  React.useEffect(() => {
    previousModalIndex.current = currentStep
  }, [currentStep])
  const direction: Direction = previousModalIndex.current > currentStep ? 'LEFT' : 'RIGHT'
  return (
    <ModalBody overflowX="hidden" {...rest}>
      <AnimatePresence exitBeforeEnter initial={false} custom={direction}>
        <Content
          key={steps[currentStep]?.id}
          variants={variants}
          custom={direction}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            ease: 'easeOut',
            duration: 0.2,
          }}
        >
          {React.Children.toArray(children)[currentStep]}
        </Content>
      </AnimatePresence>
    </ModalBody>
  )
}

ModalStepsBody.displayName = 'ModalSteps.Body'
export default ModalStepsBody
