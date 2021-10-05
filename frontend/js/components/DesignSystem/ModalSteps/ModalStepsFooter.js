// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import ModalFooter, { type Props as ModalFooterProps } from '~ds/Modal/ModalFooter';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import ModalStepsFooterContinueButton from './ModalStepsFooterContinueButton';
import ModalStepsFooterBackButton from './ModalStepsFooterBackButton';
import ModalStepsFooterValidationButton from './ModalStepsFooterValidationButton';
import Flex from '~ui/Primitives/Layout/Flex';
import Icon from '~ds/Icon/Icon';
import Link from '~ds/Link/Link';
import { useModalSteps } from '~ds/ModalSteps/ModalSteps.context';

type Props = {|
  ...ModalFooterProps,
  +children: React$Node,
|};

const NAVIGATION_BUTTONS = [
  'ModalSteps.Footer.BackButton',
  'ModalSteps.Footer.ContinueButton',
  'ModalSteps.Footer.ValidationButton',
];

const ModalStepsFooter = ({ children, ...props }: Props) => {
  const { currentStep, steps } = useModalSteps();
  const intl = useIntl();
  const step = steps[currentStep];

  if (!step) return null;

  const navigationChildren = React.Children.toArray(children).filter(child =>
    NAVIGATION_BUTTONS.includes(child.type.displayName),
  );

  return (
    <ModalFooter {...props} justify={step.infoUrl ? 'space-between' : 'flex-end'}>
      {step.infoUrl && (
        <Flex direction="row" align="center">
          <Icon name="CIRCLE_INFO" color="blue.500" size="md" />
          <Link href={step.infoUrl}>{intl.formatMessage({ id: 'information' })}</Link>
        </Flex>
      )}

      <ButtonGroup>{navigationChildren}</ButtonGroup>
    </ModalFooter>
  );
};

ModalStepsFooter.displayName = 'ModalSteps.Footer';

ModalStepsFooter.BackButton = ModalStepsFooterBackButton;
ModalStepsFooter.ContinueButton = ModalStepsFooterContinueButton;
ModalStepsFooter.ValidationButton = ModalStepsFooterValidationButton;

export default ModalStepsFooter;
