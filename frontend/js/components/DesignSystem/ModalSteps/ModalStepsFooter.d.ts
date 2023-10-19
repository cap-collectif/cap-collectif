// @ts-nocheck
import ModalFooter from '../Modal/ModalFooter'
import ModalStepsFooterBackButton from './ModalStepsFooterBackButton'
import ModalStepsFooterContinueButton from './ModalStepsFooterContinueButton'
import ModalStepsFooterValidationButton from './ModalStepsFooterValidationButton'

declare const ModalStepsFooter: ModalFooter & {
  BackButton: typeof ModalStepsFooterBackButton
  ContinueButton: typeof ModalStepsFooterContinueButton
  ValidationButton: typeof ModalStepsFooterValidationButton
}

export default ModalStepsFooter
