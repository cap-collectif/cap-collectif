import * as React from 'react'

import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { createFragmentContainer, graphql } from 'react-relay'
import { Alert } from 'react-bootstrap'
import type { ReplyCreateFormWrapper_questionnaire } from '~relay/ReplyCreateFormWrapper_questionnaire.graphql'
import '~relay/ReplyCreateFormWrapper_questionnaire.graphql'
import LoginButton from '~/components/User/Login/LoginButton'
import RegistrationButton from '~/components/User/Registration/RegistrationButton'
import ReplyForm from './ReplyForm'
import type { User } from '~/redux/modules/user'
import '~/redux/modules/user'
import type { GlobalState } from '~/types'
import { QuestionnaireStepPageContext } from '~/components/Page/QuestionnaireStepPage.context'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
type Props = {
  readonly questionnaire: ReplyCreateFormWrapper_questionnaire
  readonly user: User | null | undefined
  readonly setIsShow: (show: boolean) => void
}
const ReplyCreateFormWrapperContainer = styled.div`
  margin-top: 35px;
`
export const ReplyCreateFormWrapper = ({ questionnaire, user, setIsShow }: Props) => {
  const { anonymousRepliesIds } = React.useContext(QuestionnaireStepPageContext)
  const isAnonymousParticipationAllowed = questionnaire?.step?.isAnonymousParticipationAllowed
  const isAnonymousQuestionnaireFeatureEnabled = useFeatureFlag('anonymous_questionnaire')
  const formIsDisabled =
    questionnaire.contribuable &&
    questionnaire.viewerReplies &&
    questionnaire.viewerReplies.totalCount > 0 &&
    !questionnaire.multipleRepliesAllowed
  const canParticipateAnonymously = isAnonymousQuestionnaireFeatureEnabled ? isAnonymousParticipationAllowed : false
  return (
    <ReplyCreateFormWrapperContainer>
      {questionnaire.contribuable && !user && !canParticipateAnonymously ? (
        <Alert bsStyle="warning" className="hidden-print text-center">
          <strong>
            <FormattedMessage id="reply.not_logged_in.error" />
          </strong>
          <RegistrationButton
            bsStyle="primary"
            style={{
              marginLeft: '10px',
            }}
          />
          <LoginButton
            style={{
              marginLeft: 5,
            }}
          />
        </Alert>
      ) : (
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
      )}
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
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      multipleRepliesAllowed
      phoneConfirmationRequired
      contribuable
      viewerReplies @include(if: $isAuthenticated) {
        totalCount
      }
      step {
        isAnonymousParticipationAllowed
      }
      ...ReplyForm_questionnaire @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
})
