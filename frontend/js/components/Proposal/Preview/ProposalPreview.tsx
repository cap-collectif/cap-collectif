import React from 'react'
import { Col } from 'react-bootstrap'

import styled from 'styled-components'
import { graphql, createFragmentContainer } from 'react-relay'
import { connect } from 'react-redux'
import ProposalPreviewBody from './ProposalPreviewBody'
import ProposalPreviewFooter from './ProposalPreviewFooter'
import ProposalPreviewStatus from './ProposalPreviewStatus'
import { Card } from '~/components/Ui/Card/Card'
import type { ProposalPreview_proposal } from '~relay/ProposalPreview_proposal.graphql'
import type { ProposalPreview_step } from '~relay/ProposalPreview_step.graphql'
import type { ProposalPreview_viewer } from '~relay/ProposalPreview_viewer.graphql'
import type { FeatureToggles, State } from '~/types'
import CategoryBackground from '~/components/Ui/Medias/CategoryBackground'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import colors from '~/utils/colors'
import { bootstrapGrid } from '~/utils/sizes'
import ProposalImageContainer from '~/components/Proposal/Preview/ProposalImageContainer'
import { ProposalPreview_participant$data } from '~relay/ProposalPreview_participant.graphql'

type Props = {
  readonly proposal: ProposalPreview_proposal
  readonly step: ProposalPreview_step | null | undefined
  readonly viewer: ProposalPreview_viewer | null | undefined
  readonly participant: ProposalPreview_participant$data | null | undefined
  readonly features: FeatureToggles
  readonly isSPA?: boolean
}
const ProposalCard = styled(Card)`
  > svg {
    position: absolute;
    left: calc(50% - 20px);
    z-index: auto;
    top: 20px;

    @media (max-width: ${bootstrapGrid.mdMax}px) {
      top: 25px;
    }

    @media (max-width: ${bootstrapGrid.smMax}px) {
      top: 30px;
    }

    @media (max-width: ${bootstrapGrid.xsMax}px) {
      top: 9.5vw;
    }
  }

  #background {
    position: initial;
    z-index: auto;
  }
`

const getCategoryImage = (proposal: ProposalPreview_proposal) => {
  return proposal?.category?.categoryImage?.image?.url
}

export class ProposalPreview extends React.Component<Props> {
  render() {
    const { proposal, step, viewer, features, isSPA, participant } = this.props

    return (
      <Col componentClass="li" xs={12} sm={6} md={4} lg={3}>
        <ProposalCard
          id={`proposal-${proposal.id}`}
          className={
            proposal.author && proposal.author.vip
              ? 'bg-vip proposal-preview block--shadowed'
              : 'block--shadowed proposal-preview'
          }
        >
          {proposal.media && proposal.media.url && features.display_pictures_in_depository_proposals_list ? (
            <ProposalImageContainer
              src={proposal.media.url}
              isArchived={proposal.isArchived}
              sizes="(max-width: 320px) 320px,
                    (max-width: 640px) 640px,
                    (max-width: 960px) 640px,
                    (max-width: 1280px) 640px,
                    (max-width: 2560px) 640px,"
            />
          ) : features.display_pictures_in_depository_proposals_list ? (
            getCategoryImage(proposal) ? (
              <ProposalImageContainer
                src={getCategoryImage(proposal)}
                isArchived={proposal.isArchived}
                sizes="(max-width: 320px) 320px,
                        (max-width: 640px) 640px,
                        (max-width: 960px) 640px,
                        (max-width: 1280px) 640px,
                        (max-width: 2560px) 640px,"
              />
            ) : (
              <>
                <CategoryBackground color={proposal?.category?.color || '#1E88E5'} isArchived={proposal.isArchived} />
                {proposal?.category?.icon && (
                  <Icon name={ICON_NAME[proposal?.category?.icon]} size={40} color={colors.white} />
                )}
              </>
            )
          ) : null}
          <ProposalPreviewBody
            proposal={proposal}
            step={step}
            viewer={viewer}
            isSPA={isSPA}
            participant={participant}
          />
          {step && <ProposalPreviewFooter step={step} proposal={proposal} />}
          <ProposalPreviewStatus proposal={proposal} />
        </ProposalCard>
      </Col>
    )
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
})

export default createFragmentContainer(connect(mapStateToProps)(ProposalPreview), {
  viewer: graphql`
    fragment ProposalPreview_viewer on User @argumentDefinitions(stepId: { type: "ID!" }) {
      ...ProposalPreviewBody_viewer @arguments(stepId: $stepId)
    }
  `,
  participant: graphql`
    fragment ProposalPreview_participant on Participant @argumentDefinitions(stepId: { type: "ID!" }) {
      ...ProposalPreviewBody_participant @arguments(stepId: $stepId)
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
      token: { type: "String" }
    ) {
      id
      media {
        url
      }
      author {
        vip
      }
      category {
        icon
        color
        categoryImage {
          id
          image {
            url
          }
        }
      }
      isArchived
      ...ProposalPreviewFooter_proposal @arguments(stepId: $stepId, isProfileView: $isProfileView)
      ...ProposalPreviewBody_proposal
        @arguments(isAuthenticated: $isAuthenticated, isProfileView: $isProfileView, stepId: $stepId, token: $token)
      ...ProposalPreviewStatus_proposal @arguments(stepId: $stepId, isProfileView: $isProfileView)
    }
  `,
})
