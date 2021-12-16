// @flow
// Legacy : https://github.com/cap-collectif/platform/issues/13828
import * as React from 'react';
import { motion } from 'framer-motion';
import { graphql, useFragment } from 'react-relay';
import ProposalLeaveModalLegacy from './ProposalLeaveModalLegacy';
import ProposalErrorModalLegacy from './ProposalErrorModalLegacy';
import ProposalChangeAddressModalLegacy from './ProposalChangeAddressModalLegacy';
import type { ProposalOtherPanelsModalLegacy_proposalForm$key } from '~relay/ProposalOtherPanelsModalLegacy_proposalForm.graphql';

type Props = {|
  +onClose: () => void,
  +resetModalState: () => void,
  +errorCount: number,
  +modalState: 'LEAVE' | 'ERROR' | 'NORMAL' | 'MAP',
  +proposalForm: ProposalOtherPanelsModalLegacy_proposalForm$key,
|};

const FRAGMENT = graphql`
  fragment ProposalOtherPanelsModalLegacy_proposalForm on ProposalForm {
    id
    ...ProposalChangeAddressModalLegacy_proposalForm
  }
`;

const ProposalOtherPanelsModalLegacy = ({
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
          <ProposalLeaveModalLegacy resetModalState={resetModalState} onClose={onClose} />
        </motion.div>
      )}
      {modalState === 'MAP' && (
        <motion.div
          key="map"
          initial={{ opacity: 0, display: 'none' }}
          animate={{ opacity: 1, display: 'block' }}
          exit={{ opacity: 0, display: 'none' }}>
          <ProposalChangeAddressModalLegacy
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
          <ProposalErrorModalLegacy
            allowRetry={errorCount < 2}
            resetModalState={resetModalState}
            onClose={onClose}
          />
        </motion.div>
      )}
    </>
  );
};

export default ProposalOtherPanelsModalLegacy;
