import React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { connect } from 'react-redux'
import { submitReport } from '~/redux/modules/report'
import ReportBox from '../Report/ReportBox'
import type { OpinionReportButton_opinion } from '~relay/OpinionReportButton_opinion.graphql'
import { useIntl } from 'react-intl'

type Props = {
  dispatch: (...args: Array<any>) => any
  opinion: OpinionReportButton_opinion
}

const OpinionReportButton = ({ opinion, dispatch }: Props) => {
  const intl = useIntl()

  const handleReport = (data: Record<string, any>) => {
    if (opinion.id) {
      return submitReport(opinion.id, data, dispatch, 'alert.success.report.proposal', intl)
    }
  }

  if (!opinion || !opinion.author || !opinion.id) {
    return null
  }

  return (
    <ReportBox
      id={`opinion-${opinion.id}`}
      reported={opinion.viewerHasReport || false}
      onReport={handleReport}
      author={{
        uniqueId: opinion.author.slug,
      }}
      buttonClassName="btn--default opinion__action--report"
      buttonStyle={{
        marginRight: 5,
      }}
    />
  )
}

// @ts-ignore
const container = connect<any, any>()(OpinionReportButton)
export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionReportButton_opinion on OpinionOrVersion
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ... on Opinion {
        id
        viewerHasReport @include(if: $isAuthenticated)
        author {
          slug
        }
      }
      ... on Version {
        id
        viewerHasReport @include(if: $isAuthenticated)
        author {
          slug
        }
        parent {
          id
        }
      }
    }
  `,
})
