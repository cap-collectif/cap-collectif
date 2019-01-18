// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { Alert, Button } from 'react-bootstrap';
import { type ReplyCreateFormWrapper_questionnaire } from './__generated__/ReplyCreateFormWrapper_questionnaire.graphql';
import LoginButton from '../../User/Login/LoginButton';
import RegistrationButton from '../../User/Registration/RegistrationButton';
// import PhoneModal from '../../User/Phone/PhoneModal';
import ReplyForm from './ReplyForm';
import { type User } from '../../../redux/modules/user';
import type { GlobalState } from '../../../types';

type Props = {
  questionnaire: ReplyCreateFormWrapper_questionnaire,
  user: ?User,
};

type State = {
  showPhoneModal: boolean,
};

export class ReplyCreateFormWrapper extends React.Component<Props, State> {
  state = {
    showPhoneModal: false,
  };

  openPhoneModal() {
    this.setState({ showPhoneModal: true });
  }

  closePhoneModal() {
    this.setState({ showPhoneModal: false });
  }

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
    const { questionnaire, user } = this.props;

    return (
      <div>
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
        {questionnaire.contribuable &&
          questionnaire.phoneConfirmationRequired &&
          user &&
          !user.isPhoneConfirmed && (
            <Alert bsStyle="warning" className="hidden-print">
              <strong>
                <FormattedMessage id="phone.please_verify" />
              </strong>
              <span style={{ marginLeft: '10px' }}>
                <Button onClick={this.openPhoneModal}>
                  <FormattedMessage id="phone.check" />
                </Button>
              </span>
            </Alert>
          )}
        <ReplyForm questionnaire={questionnaire} reply={null} />
        {/* <PhoneModal show={this.state.showPhoneModal} onClose={this.closePhoneModal} /> */}
      </div>
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
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      anonymousAllowed
      description
      multipleRepliesAllowed
      phoneConfirmationRequired
      contribuable
      viewerReplies @include(if: $isAuthenticated) {
        id
      }
      id
      ...ReplyForm_questionnaire @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
