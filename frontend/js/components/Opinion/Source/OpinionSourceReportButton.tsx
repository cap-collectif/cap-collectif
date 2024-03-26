import React from 'react'
import { connect } from 'react-redux'
import { graphql, createFragmentContainer } from 'react-relay'
import ReportBox from '../../Report/ReportBox'
import { submitReport } from '~/redux/modules/report'
import type { Dispatch } from '~/types'
import type { OpinionSourceReportButton_source } from '~relay/OpinionSourceReportButton_source.graphql'
import { useIntl } from 'react-intl'

type Props = {
  dispatch: Dispatch
  source: OpinionSourceReportButton_source
}

const OpinionSourceReportButton = ({ source, dispatch }: Props) => {
  const intl = useIntl()

  const handleReport = (data: Record<string, any>) => {
    return submitReport(source.id, data, dispatch, 'alert.success.report.source', intl)
  }

  return (
    <ReportBox
      id={`source-${source.id}`}
      reported={source.viewerHasReport || false}
      onReport={handleReport}
      author={{
        uniqueId: source.author.slug,
      }}
      buttonBsSize="xs"
      buttonClassName="source__btn--report"
    />
  )
}

// @ts-ignore
const container = connect()(OpinionSourceReportButton)
export default createFragmentContainer(container, {
  source: graphql`
    fragment OpinionSourceReportButton_source on Source @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      contribuable
      id
      author {
        slug
      }
      viewerHasReport @include(if: $isAuthenticated)
    }
  `,
})
