// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { useIntl } from 'react-intl';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import type { ModalEditArgumentMobile_argument } from '~relay/ModalEditArgumentMobile_argument.graphql';
import Heading from '~ui/Primitives/Heading';
import Text from '~ui/Primitives/Text';
import { FontWeight } from '~ui/Primitives/constants';
import ArgumentCardFormEdition, {
  type FormValues,
} from '~/components/Debate/ArgumentCard/ArgumentCardFormEdition';
import UpdateDebateArgumentMutation from '~/mutations/UpdateDebateArgumentMutation';

type Props = {|
  argument: ModalEditArgumentMobile_argument,
  hidePreviousModal: () => void,
|};

const STATE = {
  FORM: 'FORM',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

const editArgument = (
  argumentId: string,
  argumentCardFormValues: FormValues,
  setModalState: (state: $Values<typeof STATE>) => void,
  setErrorCount: (count: number) => void,
  errorCount: number,
) => {
  return UpdateDebateArgumentMutation.commit({
    input: { id: argumentId, body: argumentCardFormValues.body },
  })
    .then(response => {
      if (response.updateDebateArgument?.errorCode) {
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

export const ModalEditArgumentMobile = ({ argument, hidePreviousModal }: Props) => {
  const intl = useIntl();
  const [modalState, setModalState] = React.useState<$Values<typeof STATE>>(STATE.FORM);
  const [errorCount, setErrorCount] = React.useState<number>(0);
  const [valuesSaved, setValuesSaved] = React.useState<?FormValues>(null);

  const getModalContent = (state: $Values<typeof STATE>, hideModal: () => void) => {
    switch (state) {
      case 'FORM':
        return (
          <>
            <Modal.Header>
              <Heading as="h4">{intl.formatMessage({ id: 'edit-my-argument' })}</Heading>
            </Modal.Header>

            <Modal.Body pb={6}>
              <ArgumentCardFormEdition
                argument={argument}
                isMobile
                goBack={hideModal}
                onSuccess={() => setModalState(STATE.SUCCESS)}
                onError={() => {
                  setModalState(STATE.ERROR);
                  setErrorCount(errorCount + 1);
                }}
                getValues={setValuesSaved}
                intl={intl}
              />
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
                {intl.formatMessage({ id: 'success-update-argument' })}
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
                  variantColor="primary"
                  variantSize="big"
                  width="100%"
                  justifyContent="center"
                  onClick={() => {
                    if (valuesSaved)
                      editArgument(
                        argument.id,
                        valuesSaved,
                        setModalState,
                        setErrorCount,
                        errorCount,
                      );
                  }}>
                  {intl.formatMessage({ id: 'modifications.publish' })}
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
      onClose={hidePreviousModal}
      disclosure={
        <Button variant="primary" variantColor="primary" variantSize="big" justifyContent="center">
          {intl.formatMessage({ id: 'global.edit' })}
        </Button>
      }
      ariaLabel={intl.formatMessage({ id: 'global.edit' })}>
      {({ hide: hideModalChoice }) => getModalContent(modalState, hideModalChoice)}
    </Modal>
  );
};

export default createFragmentContainer(ModalEditArgumentMobile, {
  argument: graphql`
    fragment ModalEditArgumentMobile_argument on DebateArgument {
      id
      ...ArgumentCardFormEdition_argument
    }
  `,
});
