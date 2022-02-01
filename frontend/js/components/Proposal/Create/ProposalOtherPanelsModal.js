// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import ProposalLeaveModal from './ProposalLeaveModal';
import ProposalChangeAddressModal from './ProposalChangeAddressModal';
import type { ProposalOtherPanelsModal_proposalForm$key } from '~relay/ProposalOtherPanelsModal_proposalForm.graphql';

type Props = {|
  +onClose: () => void,
  +resetModalState: () => void,
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
  proposalForm: proposalFormFragment,
}: Props): React.Node => {
  const proposalForm = useFragment(FRAGMENT, proposalFormFragment);

  return (
    <>
      {modalState === 'LEAVE' && (
        <ProposalLeaveModal resetModalState={resetModalState} onClose={onClose} />
      )}
      {modalState === 'MAP' && (
        <ProposalChangeAddressModal
          proposalForm={proposalForm}
          resetModalState={resetModalState}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default ProposalOtherPanelsModal;
