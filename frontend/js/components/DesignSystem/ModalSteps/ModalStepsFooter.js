// @flow
import * as React from 'react';
import ModalFooter, { type Props as ModalFooterProps } from '~ds/Modal/ModalFooter';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import ModalStepsFooterContinueButton from './ModalStepsFooterContinueButton';
import ModalStepsFooterBackButton from './ModalStepsFooterBackButton';
import ModalStepsFooterValidationButton from './ModalStepsFooterValidationButton';

type Props = {|
  ...ModalFooterProps,
  +children: React$Node,
|};

const NAVIGATION_BUTTONS = [
  'ModalStepsFooterBackButton',
  'ModalStepsFooterContinueButton',
  'ModalStepsFooterValidationButton',
];

const ModalStepsFooter = ({ children, ...props }: Props) => {
  const navigationChildren = React.Children.toArray(children).filter(child =>
    NAVIGATION_BUTTONS.includes(child.type.name),
  );
  const restChildren = React.Children.toArray(children).filter(
    child => !NAVIGATION_BUTTONS.includes(child.type.name),
  );

  return (
    <ModalFooter {...props}>
      {restChildren}

      <ButtonGroup>{navigationChildren}</ButtonGroup>
    </ModalFooter>
  );
};

ModalStepsFooter.displayName = 'ModalSteps.Footer';

ModalStepsFooter.BackButton = ModalStepsFooterBackButton;
ModalStepsFooter.ContinueButton = ModalStepsFooterContinueButton;
ModalStepsFooter.ValidationButton = ModalStepsFooterValidationButton;

export default ModalStepsFooter;
