import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import classNames from 'classnames'
import { Row } from 'react-bootstrap'
import ProposalPreview from '../Preview/ProposalPreview'
import ProposalListTable from './ProposalListTable'
import VisibilityBox from '../../Utils/VisibilityBox'
import type { ProposalList_step } from '~relay/ProposalList_step.graphql'
import type { ProposalList_viewer } from '~relay/ProposalList_viewer.graphql'
import type { ProposalList_proposals } from '~relay/ProposalList_proposals.graphql'
import type { ProposalViewMode } from '~/redux/modules/proposal'

type Props = {
  step: ProposalList_step | null | undefined
  proposals: ProposalList_proposals
  viewer: ProposalList_viewer | null | undefined
  view?: ProposalViewMode
}
const classes = classNames({
  'media-list': true,
  'proposal-preview-list': true,
  opinion__list: true,
})

const renderProposals = (proposals, step, viewer) => (
  <Row>
    <ul className={classes}>
      {proposals.edges &&
        proposals.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean) // @ts-expect-error
          .map((node, key) => <ProposalPreview key={key} proposal={node} step={step} viewer={viewer} isSPA />)}
    </ul>
  </Row>
)

const renderProposalListTableView = (proposals, step) => <ProposalListTable step={step} proposals={proposals} />

const getEmptyWordingProposalList = (step: ProposalList_step | null | undefined): string => {
  if (step && step.form) {
    if (step.form.objectType === 'ESTABLISHMENT') return 'establishment.empty'
    if (step.form.objectType === 'QUESTION') return 'question.empty'
    if (step.form.objectType === 'OPINION') return 'opinion.empty'
    if (step.form.objectType === 'PROPOSAL' && step.project?.type?.title === 'project.types.interpellation')
      return 'interpellation.empty'
  }

  return 'proposal.empty'
}

export class ProposalList extends React.Component<Props> {
  render() {
    const { step, proposals, viewer, view } = this.props

    if (proposals.totalCount === 0) {
      return (
        <p className="p--centered mb-40">
          <FormattedMessage id={getEmptyWordingProposalList(step)} />
        </p>
      )
    }

    const proposalsVisibleOnlyByViewer = {
      edges: [],
    }
    const proposalsVisiblePublicly = proposals
    return (
      <React.Fragment>
        {proposalsVisiblePublicly.edges && proposalsVisiblePublicly.edges.length > 0 && (
          <React.Fragment>
            {view === 'GRID'
              ? renderProposals(proposalsVisiblePublicly, step, viewer)
              : renderProposalListTableView(proposalsVisiblePublicly, step)}
          </React.Fragment>
        )}
        {proposalsVisibleOnlyByViewer.edges && proposalsVisibleOnlyByViewer.edges.length > 0 && (
          <VisibilityBox enabled>
            {view === 'GRID'
              ? renderProposals(proposalsVisibleOnlyByViewer, step, viewer)
              : renderProposalListTableView(proposalsVisibleOnlyByViewer, step)}
          </VisibilityBox>
        )}
      </React.Fragment>
    )
  }
}
export default createFragmentContainer(ProposalList, {
  viewer: graphql`
    fragment ProposalList_viewer on User @argumentDefinitions(stepId: { type: "ID!" }) {
      ...ProposalPreview_viewer @arguments(stepId: $stepId)
    }
  `,
  step: graphql`
    fragment ProposalList_step on ProposalStep {
      id
      ...ProposalListTable_step
      ...ProposalPreview_step
      ...interpellationLabelHelper_step @relay(mask: false)
      ... on CollectStep {
        kind
        form {
          id
          objectType
        }
        project {
          type {
            title
          }
        }
      }
    }
  `,
  proposals: graphql`
    fragment ProposalList_proposals on ProposalConnection {
      ...ProposalListTable_proposals @arguments(stepId: $stepId)
      totalCount
      edges {
        node {
          id
          ...ProposalPreview_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
        }
      }
    }
  `,
})
