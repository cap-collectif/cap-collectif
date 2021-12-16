// @flow
// Legacy : https://github.com/cap-collectif/platform/issues/13828
import * as React from 'react';
import { useIntl } from 'react-intl';
import { reset } from 'redux-form';
import { useDispatch } from 'react-redux';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import { formName } from '../Form/ProposalForm';
import type { Dispatch } from '~/types';
import colors from '~/styles/modules/colors';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';

type Props = {|
  +onClose: () => void,
  +resetModalState: () => void,
|};

const ProposalLeaveModalLegacy = ({ onClose, resetModalState }: Props): React.Node => {
  const intl = useIntl();
  const dispatch: Dispatch = useDispatch();
  return (
    <>
      <Modal.Body>
        <Flex direction="column" alignItems="center" my={[0, '20%']}>
          <Text textAlign="center" fontSize={33} mb={8}>
            <span className="d-b emoji-container" role="img" aria-label="Door">
              🚪
            </span>
          </Text>
          <Text textAlign="center" fontSize={[20, 33]} fontWeight={600} mb={2}>
            {intl.formatMessage({ id: 'leave-form' })}
          </Text>
          <Text maxWidth="300px" textAlign="center">
            {intl.formatMessage({ id: 'changes-will-not-be-saved' })}
          </Text>
        </Flex>
      </Modal.Body>
      <Modal.Footer spacing={2} pt={4} borderTop={`1px solid ${colors.gray[200]}`}>
        <ButtonGroup>
          <Button
            variantSize="big"
            variant="secondary"
            variantColor="hierarchy"
            onClick={resetModalState}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
          <Button
            variantSize="big"
            variant="primary"
            variantColor="danger"
            onClick={() => {
              resetModalState();
              onClose();
              dispatch(reset(formName));
            }}>
            {intl.formatMessage({ id: 'global-exit' })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </>
  );
};

export default ProposalLeaveModalLegacy;
