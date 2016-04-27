import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import UserPreview from '../../User/UserPreview';
import SubmitButton from '../../Form/SubmitButton';
import ProposalVoteForm from './ProposalVoteForm';
import LoginButton from '../../User/Login/LoginButton';
import ProposalVoteBoxMessage from './ProposalVoteBoxMessage';
import { connect } from 'react-redux';
import { VOTE_TYPE_BUDGET, VOTE_TYPE_SIMPLE } from '../../../constants/ProposalConstants';

const ProposalVoteBox = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    selectionStep: PropTypes.object.isRequired,
    userHasVote: PropTypes.bool,
    creditsLeft: PropTypes.number,
    className: PropTypes.string,
    formWrapperClassName: PropTypes.string,
    onSubmit: PropTypes.func,
    onSubmitSuccess: PropTypes.func,
    onSubmitFailure: PropTypes.func,
    onValidationFailure: PropTypes.func,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      userHasVote: false,
      creditsLeft: null,
      className: '',
      formWrapperClassName: '',
      onSubmit: () => {},
      onSubmitSuccess: () => {},
      onSubmitFailure: () => {},
      onValidationFailure: () => {},
      user: null,
    };
  },

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleSubmit() {
    this.setState({
      isSubmitting: true,
    });
    this.props.onSubmit();
  },

  handleSubmitSuccess() {
    this.setState({
      isSubmitting: false,
    });
    this.props.onSubmitSuccess();
  },

  handleSubmitFailure() {
    this.setState({
      isSubmitting: false,
    });
    this.props.onSubmitFailure();
  },

  handleValidationFailure() {
    this.setState({
      isSubmitting: false,
    });
    this.props.onValidationFailure();
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

  disableSubmitButton() {
    return !this.props.selectionStep.open || (this.props.user && this.props.selectionStep.voteType === VOTE_TYPE_BUDGET && !this.userHasEnoughCredits());
  },

  render() {
    return (
      <div className={this.props.className}>
        {
          this.props.user
            ? <UserPreview
                user={this.props.user}
                style={{ padding: '0', marginBottom: '0', fontSize: '18px' }}
            />
            : null
        }
        <div className={this.props.formWrapperClassName}>
          {
            this.displayForm()
              ? <ProposalVoteForm
              proposal={this.props.proposal}
              selectionStepId={this.props.selectionStep.id}
              isSubmitting={this.state.isSubmitting}
              onValidationFailure={this.handleValidationFailure}
              onSubmitSuccess={this.handleSubmitSuccess}
              onSubmitFailure={this.handleSubmitFailure}
              userHasVote={this.props.userHasVote}
            />
            : null
          }
          <ProposalVoteBoxMessage
            enoughCredits={this.userHasEnoughCredits()}
            submitting={this.state.isSubmitting}
            selectionStep={this.props.selectionStep}
          />
        </div>
        <SubmitButton
          id="confirm-proposal-vote"
          isSubmitting={this.state.isSubmitting}
          onSubmit={this.handleSubmit}
          label={this.props.userHasVote ? 'proposal.vote.delete' : 'proposal.vote.add'}
          bsStyle={(!this.props.userHasVote || this.state.isSubmitting) ? 'success' : 'danger'}
          className="btn-block"
          style={{ marginTop: '10px' }}
          disabled={this.disableSubmitButton()}
          loginOverlay={this.props.selectionStep.voteType === VOTE_TYPE_BUDGET}
        />
        {
          !this.props.user && this.props.selectionStep.voteType !== VOTE_TYPE_BUDGET && this.props.selectionStep.open
          ? <div>
            <p
              className="text-center excerpt"
              style={{ margin: '10px 0 0' }}
            >
              {this.getIntlMessage('global.or')}
            </p>
            <LoginButton
              label="proposal.vote.vote_with_my_account"
              className="btn-block"
            />
          </div>
          : null
        }
      </div>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(ProposalVoteBox);
