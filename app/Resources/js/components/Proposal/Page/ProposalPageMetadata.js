// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalDetailEstimation from '../Detail/ProposalDetailEstimation';
import ProposalDetailLikers from '../Detail/ProposalDetailLikers';
import TagsList from '../../Ui/List/TagsList';
import Tag from '../../Ui/Labels/Tag';
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
            <TagsList className="proposal__infos">
              {showThemes && proposal.theme && (
                <Tag size="22px" className="ellipsis" icon="cap cap-tag-1-1 icon--blue">
                  {proposal.theme.title}
                </Tag>
              )}
              {showCategories && proposal.category && (
                <Tag size="22px" className="ellipsis" icon="cap cap-tag-1-1 icon--blue">
                  {proposal.category.name}
                </Tag>
              )}
              {showDistricts && proposal.district && (
                <Tag size="22px" className="ellipsis" icon="cap cap-marker-1-1 icon--blue">
                  {proposal.district.name}
                </Tag>
              )}
              <ProposalDetailEstimation
                proposal={proposal}
                size="22px"
                className="ellipsis"
                showNullEstimation={showNullEstimation}
              />
              <div>
                <ProposalDetailLikers size="22px" proposal={proposal} />
              </div>
              <Tag size="22px" className="ellipsis" icon="cap cap-tag-1-1 icon--blue">
                {proposal.reference}
              </Tag>
            </TagsList>
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
