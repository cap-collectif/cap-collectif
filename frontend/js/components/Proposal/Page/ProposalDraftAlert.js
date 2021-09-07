// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { useIntl } from 'react-intl';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import type { ProposalDraftAlert_proposal } from '~relay/ProposalDraftAlert_proposal.graphql';
import InfoMessage from '~ds/InfoMessage/InfoMessage';

type Props = {|
  ...AppBoxProps,
  +proposal: ?ProposalDraftAlert_proposal,
|};

export const ProposalDraftAlert = ({ proposal, ...rest }: Props) => {
  const intl = useIntl();
  if (proposal?.publicationStatus === 'DRAFT') {
    return (
      // TODO: Virer le css une fois le code global nettoyé #12925
      <InfoMessage {...rest} variant="warning" css={{ p: { marginBottom: '0 !important' } }}>
        <InfoMessage.Title withIcon fontWeight={400}>
          {intl.formatMessage({ id: 'proposal.draft.explain' })}
        </InfoMessage.Title>
      </InfoMessage>
    );
  }

  return null;
};

export default createFragmentContainer(ProposalDraftAlert, {
  proposal: graphql`
    fragment ProposalDraftAlert_proposal on Proposal {
      publicationStatus
    }
  `,
});
