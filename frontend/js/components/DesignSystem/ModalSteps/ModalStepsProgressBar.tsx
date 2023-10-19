// @ts-nocheck
import * as React from 'react'
import { m as motion, AnimatePresence } from 'framer-motion'
import Flex from '~ui/Primitives/Layout/Flex'
import { useModalSteps } from '~ds/ModalSteps/ModalSteps.context'
import AppBox from '~ui/Primitives/AppBox'
import { ease } from '~/utils/motion'

const ItemFillProgressBar = motion(AppBox)
const variants = {
  empty: {
    width: 0,
  },
  fill: {
    width: '100%',
  },
}

const ModalStepsProgressBar = () => {
  const { steps, currentStep } = useModalSteps()
  if (!steps[currentStep]) return null
  return (
    <Flex direction="row" spacing={1} mt={6}>
      {steps.map((step, idx) => (
        <AppBox key={step.id} bg="blue.200" height={1} flex={1}>
          <AnimatePresence initial={false}>
            {idx <= currentStep && (
              <ItemFillProgressBar
                key={`item-fill-${step.id}`}
                height="100%"
                bg="blue.500"
                initial="empty"
                animate="fill"
                exit="empty"
                variants={variants}
                transition={{
                  duration: 0.3,
                  ease,
                }}
              />
            )}
          </AnimatePresence>
        </AppBox>
      ))}
    </Flex>
  )
}

export default ModalStepsProgressBar
