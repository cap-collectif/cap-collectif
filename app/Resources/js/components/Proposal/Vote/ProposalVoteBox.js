import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import UserPreview from '../../User/UserPreview';
import ProposalVoteForm from './ProposalVoteForm';
import LoginButton from '../../User/Login/LoginButton';
import ProposalVoteBoxMessage from './ProposalVoteBoxMessage';
import { VOTE_TYPE_BUDGET, VOTE_TYPE_SIMPLE } from '../../../constants/ProposalConstants';
import RegistrationButton from '../../User/Registration/RegistrationButton';
import { Row, Col } from 'react-bootstrap';

const ProposalVoteBox = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    selectionStep: PropTypes.object.isRequired,
    userHasVote: PropTypes.bool,
    creditsLeft: PropTypes.number,
    className: PropTypes.string,
    formWrapperClassName: PropTypes.string,
    onSubmitSuccess: PropTypes.func,
    onSubmitFailure: PropTypes.func,
    onValidationFailure: PropTypes.func,
    isSubmitting: PropTypes.bool.isRequired,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      userHasVote: false,
      creditsLeft: null,
      className: '',
      formWrapperClassName: '',
      onSubmitSuccess: () => {},
      onSubmitFailure: () => {},
      onValidationFailure: () => {},
      user: null,
    };
  },

  userHasVote() {
    const {
      user,
      userHasVote,
    } = this.props;
    return user && userHasVote;
  },

  userHasEnoughCredits() {
    const {
      creditsLeft,
      proposal,
      user,
    } = this.props;
    if (user && !this.userHasVote() && creditsLeft !== null && proposal.estimation !== null) {
      return creditsLeft >= proposal.estimation;
    }
    return true;
  },

  displayForm() {
    const {
      selectionStep,
      user,
    } = this.props;
    return selectionStep.open && (selectionStep.voteType === VOTE_TYPE_SIMPLE || (user && this.userHasEnoughCredits()));
  },

  render() {
    const {
      className,
      formWrapperClassName,
      isSubmitting,
      onSubmitFailure,
      onSubmitSuccess,
      onValidationFailure,
      proposal,
      selectionStep,
      user,
      userHasVote,
    } = this.props;
    return (
      <div className={className}>
        {
          !user && selectionStep.voteType !== VOTE_TYPE_BUDGET && selectionStep.open
          && <div>
            <p className="text-center small" style={{ fontWeight: 'bold' }}>
              {this.getIntlMessage('proposal.vote.authenticated')}
            </p>
            <Row>
              <Col xs={12} sm={6}>
                <RegistrationButton
                  className="btn-block"
                  buttonStyle={{ margin: '0' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <LoginButton
                  className="btn-darkest-gray btn-block btn--connection"
                />
              </Col>
            </Row>
            <p className="excerpt p--lined">
              <span>{this.getIntlMessage('global.or')}</span>
            </p>
          </div>
        }
        {
          user
          ? <UserPreview
            user={user}
            style={{ padding: '0', marginBottom: '0', fontSize: '18px' }}
          />
          : <p className="text-center small" style={{ marginBottom: '0', fontWeight: 'bold' }}>
            {this.getIntlMessage('proposal.vote.non_authenticated')}
          </p>
        }
        <div className={formWrapperClassName}>
          {
            this.displayForm()
              && <ProposalVoteForm
              proposal={proposal}
              selectionStepId={selectionStep.id}
              isSubmitting={isSubmitting}
              onValidationFailure={onValidationFailure}
              onSubmitSuccess={onSubmitSuccess}
              onSubmitFailure={onSubmitFailure}
              userHasVote={userHasVote}
            />
          }
          <ProposalVoteBoxMessage
            enoughCredits={this.userHasEnoughCredits()}
            submitting={isSubmitting}
            selectionStep={selectionStep}
          />
        </div>
      </div>
    );
  },

});

export default ProposalVoteBox;
