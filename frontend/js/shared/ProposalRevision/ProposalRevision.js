// @flow
import * as React from 'react';
import { useDisclosure } from '@liinkiing/react-hooks';
import { graphql, useFragment } from 'relay-hooks';
import type { ProposalRevision_proposal$key } from '~relay/ProposalRevision_proposal.graphql';
import ProposalRevisionModalForm from '~/shared/ProposalRevision/Modal/ProposalRevisionModalForm';

const FRAGMENT = graphql`
  fragment ProposalRevision_proposal on Proposal {
    ...ProposalRevisionModalForm_proposal
  }
`;

type RelayProps = {|
  proposal: ProposalRevision_proposal$key,
|};

type Props = {|
  ...RelayProps,
  +isAdminView?: boolean,
  +children?: React.Node | ((openModal: () => void) => React.Node),
  +unstable__enableCapcoUiDs?: boolean,
|};

export const ProposalRevision = ({
  proposal: proposalFragment,
  children,
  isAdminView,
  unstable__enableCapcoUiDs,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const proposal = useFragment(FRAGMENT, proposalFragment);
  return (
    <>
      {isOpen && (
        <ProposalRevisionModalForm
          isAdminView={isAdminView}
          proposal={proposal}
          show={isOpen}
          onClose={onClose}
          unstable__enableCapcoUiDs={unstable__enableCapcoUiDs}
        />
      )}
      {typeof children === 'function' ? children(onOpen) : children}
    </>
  );
};

export default ProposalRevision;
