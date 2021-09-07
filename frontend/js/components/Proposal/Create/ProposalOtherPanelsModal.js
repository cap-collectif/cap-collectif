// @flow
import * as React from 'react';
import { motion } from 'framer-motion';
import ProposalLeaveModal from './ProposalLeaveModal';
import ProposalErrorModal from './ProposalErrorModal';

type Props = {|
  +onClose: () => void,
  +resetModalState: () => void,
  +errorCount: number,
  +modalState: 'LEAVE' | 'ERROR' | 'NORMAL',
|};

const ProposalOtherPanelsModal = ({
  resetModalState,
  onClose,
  modalState,
  errorCount,
}: Props): React.Node => {
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
