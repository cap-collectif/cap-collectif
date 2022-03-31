// @flow
import * as React from 'react';
import { submit } from 'redux-form';
import { useDispatch } from 'react-redux';
import { createFragmentContainer, graphql, type RelayFragmentContainer } from 'react-relay';
import { useIntl } from 'react-intl';
import {
  Button,
  Modal,
  Heading,
  Text,
  CapUIIcon,
  CapUIModalSize,
  ButtonQuickAction,
} from '@cap-collectif/ui';
import type { ModalModerateArgumentMobile_argument } from '~relay/ModalModerateArgumentMobile_argument.graphql';
import ModerateForm, { formName, type Values } from '~/components/Moderate/ModerateForm';
import { FontWeight } from '~ui/Primitives/constants';
import TrashDebateAlternateArgumentMutation from '~/mutations/TrashDebateAlternateArgumentMutation';
import type { Dispatch } from '~/types';
import ResetCss from '~/utils/ResetCss';

type Props = {|
  argument: ModalModerateArgumentMobile_argument,
|};

const STATE = {
  FORM: 'FORM',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

const trashAlternateArgument = (
  argument: ModalModerateArgumentMobile_argument,
  moderateFormValues: Values,
  setModalState: (state: $Values<typeof STATE>) => void,
  setErrorCount: (count: number) => void,
  errorCount: number,
) => {
  return TrashDebateAlternateArgumentMutation.commit({
    input: {
      id: argument.id,
      trashedReason: moderateFormValues.reason,
      trashedStatus: moderateFormValues.hideContent ? 'INVISIBLE' : 'VISIBLE',
    },
    debateId: argument.debate.id,
    forOrAgainst: argument.type,
  })
    .then(response => {
      if (response.trash?.errorCode) {
        setModalState(STATE.ERROR);
        setErrorCount(errorCount + 1);
      } else {
        setErrorCount(0);
        setModalState(STATE.SUCCESS);
      }
    })
    .catch(() => {
      setModalState(STATE.ERROR);
      setErrorCount(errorCount + 1);
    });
};

export const ModalModerateArgumentMobile = ({ argument }: Props): React.Node => {
  const intl = useIntl();
  const dispatch = useDispatch<Dispatch>();
  const [modalState, setModalState] = React.useState<$Values<typeof STATE>>(STATE.FORM);
  const [errorCount, setErrorCount] = React.useState<number>(0);
  const [valuesSaved, setValuesSaved] = React.useState<?Values>(null);

  const resetState = () => {
    setModalState(STATE.FORM);
    setErrorCount(0);
  };

  const getModalContent = (state: $Values<typeof STATE>, hideModalChoice: () => void) => {
    switch (state) {
      case 'FORM':
        return (
          <>
            <ResetCss>
              <Modal.Header>
                <Heading as="h4">{intl.formatMessage({ id: 'moderate-argument' })}</Heading>
              </Modal.Header>
            </ResetCss>
            <Modal.Body pb={6}>
              <ModerateForm
                onSubmit={(values: Values) => {
                  setValuesSaved(values);
                  trashAlternateArgument(
                    argument,
                    values,
                    setModalState,
                    setErrorCount,
                    errorCount,
                  );
                }}
              />
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="primary"
                variantColor="danger"
                variantSize="big"
                width="100%"
                justifyContent="center"
                onClick={() => dispatch(submit(formName))}>
                {intl.formatMessage({ id: 'moderate-argument' })}
              </Button>
            </Modal.Footer>
          </>
        );
      case 'SUCCESS':
        return (
          <>
            <Modal.Header />
            <Modal.Body pb={6} pt={0} align="center">
              <Text mb={1} fontWeight={FontWeight.Semibold}>
                <Text as="span" aria-hidden role="img" mr={1}>
                  ✅
                </Text>
                <Text as="span">{intl.formatMessage({ id: 'global.thank.you' })}</Text>
              </Text>
              <Text textAlign="center" width="50%">
                {intl.formatMessage({
                  id: 'the-argument-has-been-successfully-moved-to-the-trash',
                })}
              </Text>
            </Modal.Body>
          </>
        );
      case 'ERROR':
        return (
          <>
            <Modal.Header />
            <Modal.Body pb={6} pt={0} align="center">
              <Text mb={3} aria-hidden role="img">
                😓
              </Text>
              <Text fontWeight={FontWeight.Semibold}>
                {intl.formatMessage({ id: 'error.title.damn' })}
              </Text>
              <Text textAlign="center">
                {intl.formatMessage({
                  id: errorCount <= 1 ? 'error-has-occurred' : 'error.persist.try.again',
                })}
              </Text>
            </Modal.Body>

            <Modal.Footer justify="center">
              {errorCount <= 1 ? (
                <Button
                  variant="primary"
                  variantColor="danger"
                  variantSize="big"
                  width="100%"
                  justifyContent="center"
                  onClick={() => {
                    if (valuesSaved)
                      trashAlternateArgument(
                        argument,
                        valuesSaved,
                        setModalState,
                        setErrorCount,
                        errorCount,
                      );
                  }}>
                  {intl.formatMessage({ id: 'global.report.submit' })}
                </Button>
              ) : (
                <Button variant="tertiary" variantColor="primary" onClick={hideModalChoice}>
                  {intl.formatMessage({ id: 'back.to.arguments' })}
                </Button>
              )}
            </Modal.Footer>
          </>
        );
      default:
        // eslint-disable-next-line no-unused-expressions
        (state: empty);
        throw Error(`state ${state} is not a valid state`);
    }
  };

  return (
    <Modal
      hideCloseButton
      variantSize={CapUIModalSize.Xl}
      alwaysOpenInPortal
      disclosure={
        <ButtonQuickAction
          icon={CapUIIcon.Moderate}
          variantColor="gray"
          height="32px"
          border="none"
        />
      }
      ariaLabel={intl.formatMessage({ id: 'global.report.submit' })}
      onClose={resetState}>
      {({ hide }) => getModalContent(modalState, hide)}
    </Modal>
  );
};

export default (createFragmentContainer(ModalModerateArgumentMobile, {
  argument: graphql`
    fragment ModalModerateArgumentMobile_argument on AbstractDebateArgument {
      id
      type
      debate {
        id
      }
    }
  `,
}): RelayFragmentContainer<typeof ModalModerateArgumentMobile>);
