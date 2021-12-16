// @flow
// Legacy : https://github.com/cap-collectif/platform/issues/13828
import * as React from 'react';
import { useIntl } from 'react-intl';
import { reset, isSubmitting, submit } from 'redux-form';
import { useDispatch, connect } from 'react-redux';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import { formName } from '../Form/ProposalForm';
import type { Dispatch, GlobalState } from '~/types';
import colors from '~/styles/modules/colors';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';

type Props = {|
  +onClose: () => void,
  +resetModalState: () => void,
  +allowRetry: boolean,
  +submitting: boolean,
|};

const ProposalErrorModalLegacy = ({
  onClose,
  resetModalState,
  allowRetry,
  submitting,
}: Props): React.Node => {
  const intl = useIntl();
  const dispatch: Dispatch = useDispatch();
  return (
    <>
      <Modal.Body>
        <Flex direction="column" alignItems="center" my={[0, '20%']}>
          <Text textAlign="center" fontSize={33} mb={8}>
            <span className="d-b emoji-container" role="img" aria-label="Downcast Face with Sweat">
              😓
            </span>
          </Text>
          <Text textAlign="center" fontSize={[20, 33]} fontWeight={600} mb={2}>
            {intl.formatMessage({ id: 'error.title.damn' })}
          </Text>
          <Text textAlign="center">
            {intl.formatMessage({
              id: allowRetry ? 'error.try.again' : 'error.persist.try.again',
            })}
          </Text>
        </Flex>
      </Modal.Body>
      <Modal.Footer spacing={2} pt={4} borderTop={`1px solid ${colors.gray[200]}`}>
        {!allowRetry && (
          <Button
            variantSize="big"
            variant="primary"
            variantColor="danger"
            onClick={() => {
              resetModalState();
              onClose();
              dispatch(reset(formName));
            }}>
            {intl.formatMessage({ id: 'leave-form-confirm' })}
          </Button>
        )}
        {allowRetry && (
          <Button
            variantSize="big"
            variant="primary"
            variantColor="primary"
            isLoading={submitting}
            onClick={() => {
              dispatch(submit(formName));
            }}>
            {intl.formatMessage({ id: 'save-my-proposal' })}
          </Button>
        )}
      </Modal.Footer>
    </>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  submitting: isSubmitting(formName)(state),
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(ProposalErrorModalLegacy);
