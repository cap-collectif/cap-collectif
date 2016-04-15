import React from 'react';
import { IntlMixin } from 'react-intl';
import LoginStore from '../../../stores/LoginStore';
import UserPreview from '../../User/UserPreview';
import SubmitButton from '../../Form/SubmitButton';
import IdeaCreateVoteForm from './IdeaCreateVoteForm';
import IdeaDeleteVoteForm from './IdeaDeleteVoteForm';
import IdeaActions from '../../../actions/IdeaActions';

const IdeaVoteBox = React.createClass({
  displayName: 'IdeaVoteBox',
  propTypes: {
    idea: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
    formWrapperClassName: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
      formWrapperClassName: '',
    };
  },

  getInitialState() {
    return {
      isSubmitting: false,
      anonymous: false,
    };
  },

  componentWillMount() {
    LoginStore.addChangeListener(this.onLoginChange);
  },

  componentWillUnmount() {
    LoginStore.removeChangeListener(this.onLoginChange);
  },

  onLoginChange() {
    this.setState({
      anonymous: !LoginStore.isLoggedIn(),
    });
  },

  handleSubmit() {
    this.setState({
      isSubmitting: true,
    });
  },

  handleSubmitSuccess() {
    this.setState({
      isSubmitting: false,
    });
    this.reloadVotes();
  },

  handleFailure() {
    this.setState({
      isSubmitting: false,
    });
  },

  reloadVotes() {
    IdeaActions.loadVotes(this.props.idea.id);
  },

  userHasVote() {
    return !this.state.anonymous && this.props.idea.userHasVote;
  },

  render() {
    const { idea, className, formWrapperClassName } = this.props;
    const { anonymous, isSubmitting } = this.state;
    return (
      <div className={className}>
        {
          !anonymous
            ? <UserPreview
              user={LoginStore.user}
              style={{ padding: '0', marginBottom: '0', fontSize: '18px' }}
            />
            : null
        }
        <div className={formWrapperClassName}>
          {
            this.userHasVote()
            ? <IdeaDeleteVoteForm
              idea={idea}
              isSubmitting={isSubmitting}
              onSubmitSuccess={this.handleSubmitSuccess}
              onFailure={this.handleFailure}
              anonymous={anonymous}
            />
            : <IdeaCreateVoteForm
              idea={idea}
              isSubmitting={isSubmitting}
              onSubmitSuccess={this.handleSubmitSuccess}
              onFailure={this.handleFailure}
              anonymous={anonymous}
            />
          }
        </div>
        <SubmitButton
          id="idea-vote-button"
          isSubmitting={isSubmitting}
          onSubmit={this.handleSubmit}
          label={this.userHasVote() ? 'idea.vote.delete' : 'idea.vote.add'}
          bsStyle={(!this.userHasVote() || isSubmitting) ? 'success' : 'danger'}
          className="btn-block"
          style={{ marginTop: '10px' }}
        />
      </div>
    );
  },

});

export default IdeaVoteBox;
