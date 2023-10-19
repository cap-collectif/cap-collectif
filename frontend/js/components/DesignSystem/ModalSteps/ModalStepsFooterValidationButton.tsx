// @ts-nocheck
import * as React from 'react'
import { useModalSteps } from '~ds/ModalSteps/ModalSteps.context'
import type { ButtonProps } from '~ds/Button/Button'
import Button from '~ds/Button/Button'

type Props = ButtonProps

const ModalStepsFooterValidationButton = (props: Props) => {
  const { currentStep, steps } = useModalSteps()
  const isLastStep = steps.length - 1 === currentStep
  if (!isLastStep) return null
  return (
    <Button variant="primary" variantColor="primary" variantSize="medium" {...props}>
      {steps[currentStep].validationLabel}
    </Button>
  )
}

ModalStepsFooterValidationButton.displayName = 'ModalSteps.Footer.ValidationButton'
export default ModalStepsFooterValidationButton
