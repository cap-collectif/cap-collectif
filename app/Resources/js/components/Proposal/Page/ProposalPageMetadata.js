// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalDetailEstimation from '../Detail/ProposalDetailEstimation';
import ProposalDetailLikers from '../Detail/ProposalDetailLikers';
import type { ProposalPageMetadata_proposal } from '~relay/ProposalPageMetadata_proposal.graphql';

type Props = {
  proposal: ProposalPageMetadata_proposal,
  showCategories: boolean,
  showDistricts: boolean,
  showNullEstimation: boolean,
  showThemes: boolean,
};

export class ProposalPageMetadata extends React.Component<Props> {
  render() {
    const { proposal, showCategories, showDistricts, showNullEstimation, showThemes } = this.props;
    return (
      <div>
        {((showCategories && proposal.category) ||
          (showDistricts && proposal.district) ||
          (showThemes && proposal.theme) ||
          proposal.likers ||
          (showNullEstimation && proposal.estimation)) && (
          <div className="proposal__page__metadata">
            <div className="proposal__infos">
              {showThemes && proposal.theme && (
                <div className="proposal__info proposal__info--district ellipsis">
                  <i className="cap cap-tag-1-1 icon--blue" />
                  {proposal.theme.title}
                </div>
              )}
              {showCategories && proposal.category && (
                <div className="proposal__info proposal__info--category ellipsis">
                  <i className="cap cap-tag-1-1 icon--blue" />
                  {proposal.category.name}
                </div>
              )}
              {showDistricts && proposal.district && (
                <div className="proposal__info proposal__info--district ellipsis">
                  <i className="cap cap-marker-1-1 icon--blue" />
                  {proposal.district.name}
                </div>
              )}
              {/* $FlowFixMe */}
              <ProposalDetailEstimation
                proposal={proposal}
                showNullEstimation={showNullEstimation}
              />
              {/* $FlowFixMe */}
              <div className="pt-10">
                <ProposalDetailLikers proposal={proposal} />
              </div>
              <div className="proposal__info proposal__info--reference ellipsis">
                <i className="cap cap-tag-1-1 icon--blue" />
                {proposal.reference}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default createFragmentContainer(ProposalPageMetadata, {
  proposal: graphql`
    fragment ProposalPageMetadata_proposal on Proposal {
      ...ProposalDetailEstimation_proposal
      ...ProposalDetailLikers_proposal
      id
      theme {
        title
      }
      estimation
      likers {
        id
      }
      category {
        name
      }
      district {
        name
      }
      reference
    }
  `,
});
