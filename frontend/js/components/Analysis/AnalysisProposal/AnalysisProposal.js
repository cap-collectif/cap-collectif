// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedDate, FormattedMessage } from 'react-intl';
import moment from 'moment';
import Tag from '~ui/Labels/Tag';
import type { AnalysisProposal_proposal } from '~relay/AnalysisProposal_proposal.graphql';
import AnalysisProposalContainer, {
  ProposalListRowInformations,
  ProposalInformationsContainer,
} from '~/components/Analysis/AnalysisProposal/AnalysisProposal.style';
import AnalysisProposalListRole from '~/components/Analysis/AnalysisProposalListRole/AnalysisProposalListRole';
import { AnalysisProposalListRowMeta } from '~ui/Analysis/common.style';

type Props = {
  proposal: AnalysisProposal_proposal,
};

const AnalysisProposal = ({ proposal }: Props) => (
  <AnalysisProposalContainer key={proposal.id} rowId={proposal.id}>
    <ProposalInformationsContainer>
      <h2>{proposal.title}</h2>
      <ProposalListRowInformations>
        <p>
          #{proposal.reference} • {proposal.author.username}
          {proposal.publishedAt && (
            <React.Fragment>
              {' '}
              • <FormattedMessage id="submited_on" />{' '}
              <FormattedDate
                value={moment(proposal.publishedAt)}
                day="numeric"
                month="long"
                year="numeric"
              />
            </React.Fragment>
          )}
        </p>
      </ProposalListRowInformations>
      <AnalysisProposalListRowMeta>
        {proposal.district && (
          <Tag size="10px" icon="cap cap-marker-1">
            {proposal.district.name}
          </Tag>
        )}
        {proposal.category && (
          <Tag size="10px" icon="cap cap-tag-1">
            {proposal.category.name}
          </Tag>
        )}
      </AnalysisProposalListRowMeta>
    </ProposalInformationsContainer>

    <AnalysisProposalListRole proposal={proposal} />
  </AnalysisProposalContainer>
);

export default createFragmentContainer(AnalysisProposal, {
  proposal: graphql`
    fragment AnalysisProposal_proposal on Proposal {
      id
      title
      publishedAt
      reference(full: false)
      author {
        id
        username
      }
      district {
        name
      }
      category {
        name
      }
      ...AnalysisProposalListRole_proposal
    }
  `,
});
