import React from 'react'
import { connect } from 'react-redux'
import { graphql, createFragmentContainer } from 'react-relay'
import ReportBox from '../Report/ReportBox'
import { submitReport } from '~/redux/modules/report'
import type { ArgumentReportButton_argument } from '~relay/ArgumentReportButton_argument.graphql'
import type { Dispatch } from '~/types'
import { useIntl } from 'react-intl'

type OwnProps = {
  argument: ArgumentReportButton_argument
}
type Props = OwnProps & {
  dispatch: Dispatch
}

const ArgumentReportButton = ({ argument, dispatch }: Props) => {
  const intl = useIntl()

  const handleReport = (data: Record<string, any>) => {
    if (!argument.related) {
      return
    }

    return submitReport(argument.id, data, dispatch, 'alert.success.report.argument', intl)
  }

  return (
    <ReportBox
      id={`argument-${argument.id}`}
      reported={argument.viewerHasReport || false}
      onReport={handleReport}
      author={{
        uniqueId: argument.author.slug,
      }}
      buttonBsSize="xs"
      buttonClassName="btn--outline btn-dark-gray argument__btn--report"
    />
  )
}

// @ts-ignore
const container = connect<any, any>()(ArgumentReportButton)
export default createFragmentContainer(container, {
  argument: graphql`
    fragment ArgumentReportButton_argument on Argument @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      author {
        id
        slug
      }
      related {
        id
        __typename
        related {
          id
          __typename
        }
      }
      id
      viewerHasReport @include(if: $isAuthenticated)
    }
  `,
})
