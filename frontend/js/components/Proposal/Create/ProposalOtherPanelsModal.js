// @flow
import * as React from 'react';
import { motion } from 'framer-motion';
import { graphql, useFragment } from 'react-relay';
import ProposalLeaveModal from './ProposalLeaveModal';
import ProposalErrorModal from './ProposalErrorModal';
import ProposalChangeAddressModal from './ProposalChangeAddressModal';
import type { ProposalOtherPanelsModal_proposalForm$key } from '~relay/ProposalOtherPanelsModal_proposalForm.graphql';

type Props = {|
  +onClose: () => void,
  +resetModalState: () => void,
  +errorCount: number,
  +modalState: 'LEAVE' | 'ERROR' | 'NORMAL' | 'MAP',
  +proposalForm: ProposalOtherPanelsModal_proposalForm$key,
|};

const FRAGMENT = graphql`
  fragment ProposalOtherPanelsModal_proposalForm on ProposalForm {
    id
    ...ProposalChangeAddressModal_proposalForm
  }
`;

const ProposalOtherPanelsModal = ({
  resetModalState,
  onClose,
  modalState,
  errorCount,
  proposalForm: proposalFormFragment,
}: Props): React.Node => {
  const proposalForm = useFragment(FRAGMENT, proposalFormFragment);

  return (
    <>
      {modalState === 'LEAVE' && (
        <motion.div
          key="leave"
          initial={{ opacity: 0, display: 'none' }}
          animate={{ opacity: 1, display: 'block' }}
          exit={{ opacity: 0, display: 'none' }}>
          <ProposalLeaveModal resetModalState={resetModalState} onClose={onClose} />
        </motion.div>
      )}
      {modalState === 'MAP' && (
        <motion.div
          key="map"
          initial={{ opacity: 0, display: 'none' }}
          animate={{ opacity: 1, display: 'block' }}
          exit={{ opacity: 0, display: 'none' }}>
          <ProposalChangeAddressModal
            proposalForm={proposalForm}
            resetModalState={resetModalState}
            onClose={onClose}
          />
        </motion.div>
      )}
      {modalState === 'ERROR' && (
        <motion.div
          key="error"
          initial={{ opacity: 0, display: 'none' }}
          animate={{ opacity: 1, display: 'block' }}
          exit={{ opacity: 0, display: 'none' }}>
          <ProposalErrorModal
            allowRetry={errorCount < 2}
            resetModalState={resetModalState}
            onClose={onClose}
          />
        </motion.div>
      )}
    </>
  );
};

export default ProposalOtherPanelsModal;
