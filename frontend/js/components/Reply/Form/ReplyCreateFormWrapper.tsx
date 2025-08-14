import * as React from 'react'

import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { createFragmentContainer, graphql } from 'react-relay'
import { Alert } from 'react-bootstrap'
import type { ReplyCreateFormWrapper_questionnaire } from '~relay/ReplyCreateFormWrapper_questionnaire.graphql'
import '~relay/ReplyCreateFormWrapper_questionnaire.graphql'
import ReplyForm from './ReplyForm'
import type { User } from '~/redux/modules/user'
import '~/redux/modules/user'
import type { GlobalState } from '~/types'
import { QuestionnaireStepPageContext } from '~/components/Page/QuestionnaireStepPage.context'
type Props = {
  readonly questionnaire: ReplyCreateFormWrapper_questionnaire
  readonly user: User | null | undefined
  readonly setIsShow: (show: boolean) => void
}
const ReplyCreateFormWrapperContainer = styled.div`
  margin-top: 35px;
`
export const ReplyCreateFormWrapper = ({ questionnaire, setIsShow }: Props) => {
  const { anonymousRepliesIds } = React.useContext(QuestionnaireStepPageContext)
  const formIsDisabled =
    questionnaire.contribuable &&
    questionnaire.viewerReplies &&
    questionnaire.viewerReplies.totalCount > 0 &&
    !questionnaire.multipleRepliesAllowed
  return (
    <ReplyCreateFormWrapperContainer>
      {
        formIsDisabled && (
          <Alert bsStyle="warning" className="hidden-print">
            <strong>
              <FormattedMessage id="reply.user_has_reply.reason" />
            </strong>
            <p>
              <FormattedMessage id="reply.user_has_reply.error" />
            </p>
          </Alert>
        )
      }
      <ReplyForm
        questionnaire={questionnaire}
        reply={null}
        setIsShow={setIsShow}
        anonymousRepliesIds={anonymousRepliesIds}
      />
    </ReplyCreateFormWrapperContainer>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  user: state.user.user,
})

// @ts-ignore
const container = connect(mapStateToProps)(ReplyCreateFormWrapper)
export default createFragmentContainer(container, {
  questionnaire: graphql`
    fragment ReplyCreateFormWrapper_questionnaire on Questionnaire
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, participantToken: { type: "String" }) {
      id
      multipleRepliesAllowed
      phoneConfirmationRequired
      contribuable
      viewerReplies @include(if: $isAuthenticated) {
        totalCount
      }
      ...ReplyForm_questionnaire @arguments(isAuthenticated: $isAuthenticated, participantToken: $participantToken)
    }
  `,
})
