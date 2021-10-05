// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useModalSteps } from '~ds/ModalSteps/ModalSteps.context';
import Button, { type ButtonProps } from '~ds/Button/Button';
import { useModal } from '~ds/Modal/Modal.context';

type Props = ButtonProps;

const ModalStepsFooterBackButton = (props: Props) => {
  const { hide } = useModal();
  const { currentStep, steps, setCurrentStep } = useModalSteps();
  const intl = useIntl();
  const isFirstStep = currentStep === 0;

  const previousStep = steps[currentStep - 1] ? () => setCurrentStep(currentStep - 1) : null;

  return (
    <Button
      variant="secondary"
      variantColor="hierarchy"
      variantSize="medium"
      onClick={isFirstStep ? hide : previousStep}
      {...props}>
      {intl.formatMessage({ id: isFirstStep ? 'cancel' : 'global.back' })}
    </Button>
  );
};

ModalStepsFooterBackButton.displayName = 'ModalSteps.Footer.BackButton';

export default ModalStepsFooterBackButton;
