// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { Alert } from 'react-bootstrap';
import { type ReplyCreateFormWrapper_questionnaire } from '~relay/ReplyCreateFormWrapper_questionnaire.graphql';
import LoginButton from '~/components/User/Login/LoginButton';
import RegistrationButton from '~/components/User/Registration/RegistrationButton';
import ReplyForm from './ReplyForm';
import { type User } from '~/redux/modules/user';
import type { GlobalState } from '~/types';

type Props = {
  questionnaire: ReplyCreateFormWrapper_questionnaire,
  user: ?User,
  setIsShow: (show: boolean) => void,
};

const ReplyCreateFormWrapperContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin-top: 35px;
`;

export class ReplyCreateFormWrapper extends React.Component<Props> {
  formIsDisabled() {
    const { questionnaire, user } = this.props;
    return (
      !questionnaire.contribuable ||
      !user ||
      (questionnaire.phoneConfirmationRequired && !user.isPhoneConfirmed) ||
      (questionnaire.viewerReplies &&
        questionnaire.viewerReplies.length > 0 &&
        !questionnaire.multipleRepliesAllowed)
    );
  }

  render() {
    const { questionnaire, user, setIsShow } = this.props;

    return (
      <ReplyCreateFormWrapperContainer>
        {questionnaire.contribuable && !user ? (
          <Alert bsStyle="warning" className="hidden-print text-center">
            <strong>
              <FormattedMessage id="reply.not_logged_in.error" />
            </strong>
            <RegistrationButton bsStyle="primary" style={{ marginLeft: '10px' }} />
            <LoginButton style={{ marginLeft: 5 }} />
          </Alert>
        ) : (
          questionnaire.contribuable &&
          questionnaire.viewerReplies &&
          questionnaire.viewerReplies.length > 0 &&
          !questionnaire.multipleRepliesAllowed && (
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
        <ReplyForm questionnaire={questionnaire} reply={null} setIsShow={setIsShow} />
      </ReplyCreateFormWrapperContainer>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  user: state.user.user,
});

const container = connect(mapStateToProps)(ReplyCreateFormWrapper);

export default createFragmentContainer(container, {
  questionnaire: graphql`
    fragment ReplyCreateFormWrapper_questionnaire on Questionnaire
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      multipleRepliesAllowed
      phoneConfirmationRequired
      contribuable
      viewerReplies @include(if: $isAuthenticated) {
        id
      }
      ...ReplyForm_questionnaire @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
