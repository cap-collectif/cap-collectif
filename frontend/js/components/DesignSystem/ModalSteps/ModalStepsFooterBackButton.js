// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useModalSteps } from '~ds/ModalSteps/ModalSteps.context';
import Button, { type ButtonProps } from '~ds/Button/Button';

type Props = ButtonProps;

const ModalStepsFooterBackButton = (props: Props) => {
  const { currentStep, steps, setCurrentStep } = useModalSteps();
  const intl = useIntl();

  const previousStep = steps[currentStep - 1] ? () => setCurrentStep(currentStep - 1) : null;

  if (!previousStep) return null;

  return (
    <Button
      variant="secondary"
      variantColor="hierarchy"
      variantSize="medium"
      onClick={previousStep}
      {...props}>
      {intl.formatMessage({ id: 'global.back' })}
    </Button>
  );
};

ModalStepsFooterBackButton.displayName = 'ModalSteps.Footer.BackButton';

export default ModalStepsFooterBackButton;
