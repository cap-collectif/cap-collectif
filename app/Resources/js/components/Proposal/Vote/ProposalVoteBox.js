import React from 'react';
import {IntlMixin} from 'react-intl';
import LoginStore from '../../../stores/LoginStore';
import UserPreview from '../../User/UserPreview';
import SubmitButton from '../../Form/SubmitButton';
import ProposalVoteForm from './ProposalVoteForm';
import LoginButton from '../../Utils/LoginButton';

const ProposalVoteBox = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    selectionStepId: React.PropTypes.number.isRequired,
    userHasVote: React.PropTypes.bool,
    className: React.PropTypes.string,
    formWrapperClassName: React.PropTypes.string,
    onSubmit: React.PropTypes.func,
    onSubmitSuccess: React.PropTypes.func,
    onSubmitFailure: React.PropTypes.func,
    onValidationFailure: React.PropTypes.func,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      userHasVote: false,
      className: '',
      formWrapperClassName: '',
      onSubmit: () => {},
      onSubmitSuccess: () => {},
      onSubmitFailure: () => {},
      onValidationFailure: () => {},
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

  render() {
    return (
      <div className={this.props.className}>
        {
          LoginStore.isLoggedIn()
            ? <UserPreview
                user={LoginStore.user}
                style={{padding: '0', marginBottom: '0', fontSize: '18px'}}
            />
            : null
        }
        <div className={this.props.formWrapperClassName}>
          <ProposalVoteForm
            proposal={this.props.proposal}
            selectionStepId={this.props.selectionStepId}
            isSubmitting={this.state.isSubmitting}
            onValidationFailure={this.handleValidationFailure}
            onSubmitSuccess={this.handleSubmitSuccess}
            onSubmitFailure={this.handleSubmitFailure}
            userHasVote={this.props.userHasVote}
          />
        </div>
        <SubmitButton
          id="confirm-proposal-vote"
          isSubmitting={this.state.isSubmitting}
          onSubmit={this.handleSubmit}
          label={this.props.userHasVote ? 'proposal.vote.delete' : 'proposal.vote.add'}
          bsStyle={(!this.props.userHasVote || this.state.isSubmitting) ? 'success' : 'danger'}
          className="btn-block"
          style={{marginTop: '10px'}}
        />
        {
          !LoginStore.isLoggedIn()
          ? <div>
            <p
              className="text-center excerpt"
              style={{margin: '10px 0 0'}}
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

export default ProposalVoteBox;
