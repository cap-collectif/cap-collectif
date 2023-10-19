// @ts-nocheck
import * as React from 'react'
import { useModalSteps } from '~ds/ModalSteps/ModalSteps.context'
import type { ButtonProps } from '~ds/Button/Button'
import Button from '~ds/Button/Button'

type Props = ButtonProps

const ModalStepsFooterContinueButton = (props: Props) => {
  const { currentStep, steps, setCurrentStep } = useModalSteps()
  const nextStep = steps[currentStep + 1] ? () => setCurrentStep(currentStep + 1) : null
  if (!nextStep) return null
  return (
    <Button
      variant="secondary"
      variantColor="primary"
      variantSize="medium"
      rightIcon="LONG_ARROW_RIGHT"
      onClick={nextStep}
      {...props}
    >
      {steps[currentStep].validationLabel}
    </Button>
  )
}

ModalStepsFooterContinueButton.displayName = 'ModalSteps.Footer.ContinueButton'
export default ModalStepsFooterContinueButton
