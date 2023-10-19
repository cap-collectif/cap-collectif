// @ts-nocheck
import * as React from 'react'
import type { ModalProps } from '~ds/Modal/Modal'
import Modal from '~ds/Modal/Modal'
import type { Step } from '~ds/ModalSteps/ModalSteps.context'
import { ModalStepsContext } from '~ds/ModalSteps/ModalSteps.context'
import ModalStepsProgressBar from './ModalStepsProgressBar'
import ModalStepsHeader from './ModalStepsHeader'
import ModalStepsBody from './ModalStepsBody'
import ModalStepsFooter from './ModalStepsFooter'
type ModalStepsProps = ModalProps & {
  readonly defaultStepId?: string
  readonly resetStepOnClose?: boolean
}

const ModalSteps = ({ children, defaultStepId, resetStepOnClose = true, onClose, ...rest }: ModalStepsProps) => {
  const [currentStep, setCurrentStep] = React.useState<number>(0)
  const [stepsRegistered, registerSteps] = React.useState<Step[]>([])
  const context = React.useMemo(
    () => ({
      currentStep,
      setCurrentStep,
      steps: stepsRegistered,
      registerSteps,
    }),
    [currentStep, stepsRegistered],
  )
  React.useEffect(() => {
    const defaultStep: number = defaultStepId ? stepsRegistered.findIndex(step => step.id === defaultStepId) || 0 : 0
    setCurrentStep(defaultStep)
  }, [defaultStepId, resetStepOnClose, stepsRegistered])

  const handleOnClose = () => {
    if (resetStepOnClose) {
      const defaultStep: number = defaultStepId ? stepsRegistered.findIndex(step => step.id === defaultStepId) || 0 : 0
      setCurrentStep(defaultStep)
    }

    if (onClose) onClose()
  }

  return (
    <ModalStepsContext.Provider value={context}>
      <Modal {...rest} onClose={handleOnClose}>
        {modalProps => (typeof children === 'function' ? children(modalProps) : children)}
      </Modal>
    </ModalStepsContext.Provider>
  )
}

ModalSteps.displayName = 'ModalSteps'
ModalSteps.Header = ModalStepsHeader
ModalSteps.Footer = ModalStepsFooter
ModalSteps.ProgressBar = ModalStepsProgressBar
ModalSteps.Body = ModalStepsBody
export default ModalSteps
