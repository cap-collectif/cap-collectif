// @flow
import * as React from 'react';
import { submit } from 'redux-form';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { useIntl } from 'react-intl';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';
import Modal from '~ds/Modal/Modal';
import type { ModalModerateArgumentMobile_argument } from '~relay/ModalModerateArgumentMobile_argument.graphql';
import Heading from '~ui/Primitives/Heading';
import ModerateForm, { formName, type Values } from '~/components/Moderate/ModerateForm';
import Text from '~ui/Primitives/Text';
import { FontWeight } from '~ui/Primitives/constants';
import TrashDebateAlternateArgumentMutation from '~/mutations/TrashDebateAlternateArgumentMutation';
import type { Dispatch } from '~/types';

type Props = {|
  argument: ModalModerateArgumentMobile_argument,
  dispatch: Dispatch,
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

export const ModalModerateArgumentMobile = ({ argument, dispatch }: Props) => {
  const intl = useIntl();
  const [modalState, setModalState] = React.useState<$Values<typeof STATE>>(STATE.FORM);
  const [errorCount, setErrorCount] = React.useState<number>(0);
  const [valuesSaved, setValuesSaved] = React.useState<?Values>(null);

  const getModalContent = (state: $Values<typeof STATE>, hideModalChoice: () => void) => {
    switch (state) {
      case 'FORM':
        return (
          <>
            <Modal.Header>
              <Heading as="h4">{intl.formatMessage({ id: 'moderate-argument' })}</Heading>
            </Modal.Header>

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
      disclosure={<Button rightIcon={ICON_NAME.MODERATE} color="neutral-gray.500" />}
      ariaLabel={intl.formatMessage({ id: 'global.report.submit' })}>
      {({ hide }) => getModalContent(modalState, hide)}
    </Modal>
  );
};

const ModalModerateArgumentMobileConnected = connect<any, any, _, _, _, _>()(
  ModalModerateArgumentMobile,
);

export default createFragmentContainer(ModalModerateArgumentMobileConnected, {
  argument: graphql`
    fragment ModalModerateArgumentMobile_argument on DebateArgument {
      id
      type
      debate {
        id
      }
    }
  `,
});
