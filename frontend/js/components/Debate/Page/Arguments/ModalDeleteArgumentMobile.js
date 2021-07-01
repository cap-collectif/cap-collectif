// @flow
import * as React from 'react';
import { useIntl, type IntlShape } from 'react-intl';
import { createFragmentContainer, graphql, type RelayFragmentContainer } from 'react-relay';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import type { ModalDeleteArgumentMobile_argument } from '~relay/ModalDeleteArgumentMobile_argument.graphql';
import Text from '~ui/Primitives/Text';
import { FontWeight } from '~ui/Primitives/constants';
import { ICON_NAME } from '~ds/Icon/Icon';
import { formatConnectionPath } from '~/shared/utils/relay';
import DeleteDebateArgumentMutation from '~/mutations/DeleteDebateArgumentMutation';
import DeleteDebateAnonymousArgumentMutation from '~/mutations/DeleteDebateAnonymousArgumentMutation';
import Heading from '~ui/Primitives/Heading';
import CookieMonster from '~/CookieMonster';

type Props = {|
  argument: ModalDeleteArgumentMobile_argument,
  hasViewer?: boolean,
  hidePreviousModal: () => void,
|};

const STATE = {
  CHOICES: 'CHOICES',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

const deleteArgument = (
  argument: ModalDeleteArgumentMobile_argument,
  intl: IntlShape,
  setModalState: (state: $Values<typeof STATE>) => void,
  setErrorCount: (count: number) => void,
  errorCount: number,
  hasViewer?: boolean,
) => {
  const connections = [
    formatConnectionPath(
      ['client', argument.debate.id],
      'DebateStepPageAlternateArgumentsPagination_alternateArguments',
    ),
  ];
  const anonymousArgumentHash = CookieMonster.getHashedDebateAnonymousArgumentCookie(
    argument.debate.id,
  );

  return hasViewer
    ? DeleteDebateArgumentMutation.commit({
        input: {
          id: argument.id,
        },
        connections,
        debateId: argument.debate.id,
      })
        .then(response => {
          if (response.deleteDebateArgument?.errorCode) {
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
        })
    : DeleteDebateAnonymousArgumentMutation.commit({
        input: {
          debate: argument.debate.id,
          hash: anonymousArgumentHash || '',
        },
        connections,
        debateId: argument.debate.id,
      })
        .then(response => {
          if (response.deleteDebateAnonymousArgument?.errorCode) {
            setModalState(STATE.ERROR);
            setErrorCount(errorCount + 1);
          } else {
            CookieMonster.removeDebateAnonymousArgumentCookie(argument.debate.id);
            setErrorCount(0);
            setModalState(STATE.SUCCESS);
          }
        })
        .catch(() => {
          setModalState(STATE.ERROR);
          setErrorCount(errorCount + 1);
        });
};

export const ModalDeleteArgumentMobile = ({
  argument,
  hidePreviousModal,
  hasViewer,
}: Props): React.Node => {
  const intl = useIntl();
  const [modalState, setModalState] = React.useState<$Values<typeof STATE>>(STATE.CHOICES);
  const [errorCount, setErrorCount] = React.useState<number>(0);

  const resetState = () => {
    setModalState(STATE.CHOICES);
    setErrorCount(0);
  };

  const getModalContent = (state: $Values<typeof STATE>, hideModal) => {
    switch (state) {
      case 'CHOICES':
        return (
          <>
            <Modal.Header>
              <Heading as="h4">{intl.formatMessage({ id: 'confirm-delete-argument' })}</Heading>
            </Modal.Header>

            <Modal.Body pb={6}>
              <Button
                onClick={() =>
                  deleteArgument(
                    argument,
                    intl,
                    setModalState,
                    setErrorCount,
                    errorCount,
                    hasViewer,
                  )
                }
                variant="primary"
                variantColor="danger"
                variantSize="big"
                justifyContent="center"
                mb={4}>
                {intl.formatMessage({ id: 'global.confirm.removal' })}
              </Button>
              <Button
                variant="tertiary"
                variantColor="hierarchy"
                onClick={hideModal}
                justifyContent="center">
                {intl.formatMessage({ id: 'global.cancel' })}
              </Button>
            </Modal.Body>
          </>
        );
      case 'SUCCESS':
        return (
          <>
            <Modal.Header />
            <Modal.Body pb={6} pt={0} align="center">
              <Text aria-hidden role="img" mb={1} fontWeight={FontWeight.Semibold}>
                ✅
              </Text>
              <Text textAlign="center" width="50%">
                {intl.formatMessage({ id: 'alert.success.delete.argument' })}
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
                  onClick={() =>
                    deleteArgument(
                      argument,
                      intl,
                      setModalState,
                      setErrorCount,
                      errorCount,
                      hasViewer,
                    )
                  }>
                  {intl.formatMessage({ id: 'global.delete' })}
                </Button>
              ) : (
                <Button variant="tertiary" variantColor="hierarchy" onClick={hideModal}>
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
      disclosure={
        <Button
          justifyContent="center"
          variant="tertiary"
          variantColor="danger"
          leftIcon={ICON_NAME.TRASH}>
          {intl.formatMessage({ id: 'global.delete' })}
        </Button>
      }
      onClose={() => {
        resetState();
        hidePreviousModal();
      }}
      ariaLabel={intl.formatMessage({ id: 'confirm-delete-argument' })}>
      {({ hide }) => getModalContent(modalState, hide)}
    </Modal>
  );
};

export default (createFragmentContainer(ModalDeleteArgumentMobile, {
  argument: graphql`
    fragment ModalDeleteArgumentMobile_argument on AbstractDebateArgument {
      id
      debate {
        id
      }
    }
  `,
}): RelayFragmentContainer<typeof ModalDeleteArgumentMobile>);
