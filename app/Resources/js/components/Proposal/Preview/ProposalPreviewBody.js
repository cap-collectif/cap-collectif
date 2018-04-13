// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import Truncate from 'react-truncate';
import { QueryRenderer, graphql } from 'react-relay';
import ProposalPreviewVote from './ProposalPreviewVote';
import ProposalDetailEstimation from '../Detail/ProposalDetailEstimation';
import ProposalDetailLikers from '../Detail/ProposalDetailLikers';
import ProposalVoteThresholdProgressBar from '../Vote/ProposalVoteThresholdProgressBar';
import TagsList from '../../Ui/List/TagsList';
import { type State } from '../../../types';
import ProposalFollowButton from '../Follow/ProposalFollowButton';
import type ProposalPreviewFollowerButtonQueryResponse from '../Preview/__generated__/ProposalPreviewBodyFollowerButtonQuery.graphql';
import environment, { graphqlError } from '../../../createRelayEnvironment';

type Props = {
  proposal: Object,
  showNullEstimation: boolean,
  showThemes: boolean,
  features: Object,
  step: Object,
  isAuthenticated: boolean,
};

export class ProposalPreviewBody extends React.Component<Props> {
  render() {
    const { proposal, showThemes, showNullEstimation, features, step } = this.props;

    return (
      <div className="card__body">
        <div className="card__body__infos">
          <a href={proposal.show_url ? proposal.show_url : proposal._links.show}>
            <h2 className="card__title">
              <Truncate lines={3}>{proposal.title}</Truncate>
            </h2>
          </a>
          <div className="excerpt small">{proposal.summaryOrBodyExcerpt}</div>
          <TagsList>
            {features.themes &&
              showThemes &&
              proposal.theme && (
                <div className="tags-list__tag">
                  <i className="cap cap-tag-1-1 icon--blue" />
                  {proposal.theme.title}
                </div>
              )}
            {proposal.category && (
              <div className="tags-list__tag">
                <i className="cap cap-tag-1-1 icon--blue" />
                {proposal.category.name}
              </div>
            )}
            {features.districts &&
              proposal.district && (
                <div className="tags-list__tag">
                  <i className="cap cap-marker-1-1 icon--blue" />
                  {proposal.district.name}
                </div>
              )}
            <ProposalDetailEstimation proposal={proposal} showNullEstimation={showNullEstimation} />
            <ProposalDetailLikers proposal={proposal} />
          </TagsList>
        </div>
        <div className="proposal__buttons">
          {step.id === proposal.votableStepId && <ProposalPreviewVote proposal={proposal} />}
          <QueryRenderer
            environment={environment}
            query={graphql`
              query ProposalPreviewBodyFollowerButtonQuery(
                $proposalId: ID!
                $isAuthenticated: Boolean!
              ) {
                proposal: node(id: $proposalId) {
                  ...ProposalFollowButton_proposal @arguments(isAuthenticated: $isAuthenticated)
                }
              }
            `}
            variables={{ proposalId: proposal.id, isAuthenticated: this.props.isAuthenticated }}
            render={({
              error,
              props,
            }: {
              error: ?Error,
              props?: ProposalPreviewFollowerButtonQueryResponse,
            }) => {
              if (error) {
                console.warn(error); // eslint-disable-line no-console
                return graphqlError;
              }
              if (props) {
                // eslint-disable-next-line react/prop-types
                if (props.proposal) {
                  return <ProposalFollowButton proposal={props.proposal} />;
                }
                return graphqlError;
              }
              return null;
            }}
          />
        </div>
        {step.voteThreshold > 0 && (
          <div style={{ marginTop: '20px' }}>
            <ProposalVoteThresholdProgressBar proposal={proposal} step={step} />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
  return {
    features: state.default.features,
    isAuthenticated: state.user.user !== null,
  };
};

export default connect(mapStateToProps)(ProposalPreviewBody);
