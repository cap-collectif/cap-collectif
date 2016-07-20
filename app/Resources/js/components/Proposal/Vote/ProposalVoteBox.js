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
    return this.props.user && this.props.userHasVote;
  },

  userHasEnoughCredits() {
    if (this.props.user && !this.userHasVote() && this.props.creditsLeft !== null && this.props.proposal.estimation !== null) {
      return this.props.creditsLeft >= this.props.proposal.estimation;
    }
    return true;
  },

  displayForm() {
    return this.props.selectionStep.open && (this.props.selectionStep.voteType === VOTE_TYPE_SIMPLE || (this.props.user && this.userHasEnoughCredits()));
  },

  render() {
    return (
      <div className={this.props.className}>
        {
          !this.props.user && this.props.selectionStep.voteType !== VOTE_TYPE_BUDGET && this.props.selectionStep.open
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
                  className="btn-block btn--connection"
                />
              </Col>
            </Row>
            <p className="excerpt p--lined">
              <span>{this.getIntlMessage('global.or')}</span>
            </p>
          </div>
        }
        {
          this.props.user
          ? <UserPreview
            user={this.props.user}
            style={{ padding: '0', marginBottom: '0', fontSize: '18px' }}
          />
          : <p className="text-center small" style={{ marginBottom: '0', fontWeight: 'bold' }}>
            {this.getIntlMessage('proposal.vote.non_authenticated')}
          </p>
        }
        <div className={this.props.formWrapperClassName}>
          {
            this.displayForm()
              && <ProposalVoteForm
              proposal={this.props.proposal}
              selectionStepId={this.props.selectionStep.id}
              isSubmitting={this.props.isSubmitting}
              onValidationFailure={this.props.onValidationFailure}
              onSubmitSuccess={this.props.onSubmitSuccess}
              onSubmitFailure={this.props.onSubmitFailure}
              userHasVote={this.props.userHasVote}
            />
          }
          <ProposalVoteBoxMessage
            enoughCredits={this.userHasEnoughCredits()}
            submitting={this.props.isSubmitting}
            selectionStep={this.props.selectionStep}
          />
        </div>
      </div>
    );
  },

});

export default ProposalVoteBox;
