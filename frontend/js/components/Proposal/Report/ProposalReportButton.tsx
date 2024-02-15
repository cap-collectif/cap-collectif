import * as React from 'react'
import { connect } from 'react-redux'
import { graphql, createFragmentContainer } from 'react-relay'
import ReportBox from '../../Report/ReportBox'
import { submitReport } from '~/redux/modules/report'
import type { ProposalReportButton_proposal } from '~relay/ProposalReportButton_proposal.graphql'
import { useIntl } from 'react-intl'

type Props = {
  proposal: ProposalReportButton_proposal
  dispatch: (...args: Array<any>) => any
  disabled?: boolean
}
export const ProposalReportButton = ({ proposal, disabled, dispatch }: Props) => {
  const intl = useIntl()

  const handleReport = (data: Record<string, any>) => {
    return submitReport(proposal.id, data, dispatch, 'alert.success.report.proposal', intl)
  }

  return (
    <ReportBox
      id={`proposal-${proposal?.id || 'placeholder'}`}
      disabled={disabled}
      reported={proposal?.viewerHasReport || false}
      onReport={handleReport}
      author={proposal?.author}
      buttonClassName="proposal__btn--report"
    />
  )
}
// @ts-ignore
const container = connect<any, any>()(ProposalReportButton)
export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalReportButton_proposal on Proposal @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      author {
        id
      }
      viewerHasReport @include(if: $isAuthenticated)
    }
  `,
})
