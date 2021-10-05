// @flow
import * as React from 'react';
import ModalHeader, { type Props as ModalHeaderProps } from '~ds/Modal/ModalHeader';
import ModalHeaderLabel from '~ds/Modal/ModalHeaderLabel';
import Heading from '~ui/Primitives/Heading';
import { useModalSteps } from '~ds/ModalSteps/ModalSteps.context';

type Props = {|
  ...ModalHeaderProps,
  +children: React.Element<typeof ModalHeaderLabel>,
|};

const ModalStepsHeader = ({ children, ...rest }: Props) => {
  const { currentStep, steps } = useModalSteps();
  const isLastStep = steps.length - 1 === currentStep;

  if (!steps[currentStep]) return null;

  // Its the ModalHeaderLabel here
  const headerLabel = React.Children.toArray(children)[0].props.children;

  return (
    <ModalHeader height="66px" {...rest}>
      {!isLastStep && children}
      <Heading>{isLastStep ? headerLabel : steps[currentStep].label}</Heading>
    </ModalHeader>
  );
};

ModalStepsHeader.Label = ModalHeaderLabel;

ModalStepsHeader.displayName = 'ModalSteps.Header';

export default ModalStepsHeader;
