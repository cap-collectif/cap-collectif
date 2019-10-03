// @flow
import React from 'react';
import { Col } from 'react-bootstrap';
import styled from 'styled-components';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import ProposalPreviewBody from './ProposalPreviewBody';
import ProposalPreviewFooter from './ProposalPreviewFooter';
import ProposalPreviewStatus from './ProposalPreviewStatus';
import { Card } from '../../Ui/Card/Card';
import type { ProposalPreview_proposal } from '~relay/ProposalPreview_proposal.graphql';
import type { ProposalPreview_step } from '~relay/ProposalPreview_step.graphql';
import type { ProposalPreview_viewer } from '~relay/ProposalPreview_viewer.graphql';
import type { FeatureToggles, State } from '../../../types';

type Props = {|
  +proposal: ProposalPreview_proposal,
  +step: ?ProposalPreview_step,
  +viewer: ?ProposalPreview_viewer,
  +features: FeatureToggles,
|};

const ProposalDefaultImage = styled.div.attrs()`
  border-radius: 4px 4px 0 0;
  height: 83px;
  max-width: 261px;
  background-image: url('/svg/preview-proposal-image.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;

  @media (max-width: 838px) {
    background-image: url('/svg/preview-proposal-image-grand.svg');
    max-width: 900px;
    height: 160px;
  }
`;

const ProposalImage = styled.div.attrs()`
  border-radius: 4px 4px 0 0;
  height: 83px;
  max-width: 261px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-image: url(${props => props.bgImage});

  @media (max-width: 838px) {
    max-width: 900px;
    height: 160px;
  }
`;

export class ProposalPreview extends React.Component<Props> {
  render() {
    const { proposal, step, viewer, features } = this.props;
    return (
      <Col componentClass="li" xs={12} sm={6} md={4} lg={3}>
        <Card
          id={`proposal-${proposal.id}`}
          className={
            proposal.author && proposal.author.vip
              ? 'bg-vip proposal-preview block--shadowed'
              : 'block--shadowed proposal-preview'
          }>
          {proposal.media &&
          proposal.media.url &&
          features.display_pictures_in_depository_proposals_list ? (
            <ProposalImage bgImage={proposal.media.url} />
          ) : (
            <ProposalDefaultImage />
          )}
          <ProposalPreviewBody proposal={proposal} step={step} viewer={viewer} />
          {step && <ProposalPreviewFooter step={step} proposal={proposal} />}
          <ProposalPreviewStatus proposal={proposal} />
        </Card>
      </Col>
    );
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default createFragmentContainer(connect(mapStateToProps)(ProposalPreview), {
  viewer: graphql`
    fragment ProposalPreview_viewer on User {
      ...ProposalPreviewBody_viewer
    }
  `,
  step: graphql`
    fragment ProposalPreview_step on Step {
      ...ProposalPreviewBody_step
      ...ProposalPreviewFooter_step
    }
  `,
  proposal: graphql`
    fragment ProposalPreview_proposal on Proposal
      @argumentDefinitions(
        stepId: { type: "ID!" }
        isAuthenticated: { type: "Boolean!" }
        isProfileView: { type: "Boolean", defaultValue: false }
      ) {
      id
      media {
        url
      }
      author {
        vip
      }
      ...ProposalPreviewFooter_proposal @arguments(stepId: $stepId, isProfileView: $isProfileView)
      ...ProposalPreviewBody_proposal
        @arguments(isAuthenticated: $isAuthenticated, isProfileView: $isProfileView)
      ...ProposalPreviewStatus_proposal @arguments(stepId: $stepId, isProfileView: $isProfileView)
    }
  `,
});
