import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import UserPreview from '../../User/UserPreview';
import SubmitButton from '../../Form/SubmitButton';
import IdeaCreateVoteForm from './IdeaCreateVoteForm';
import IdeaDeleteVoteForm from './IdeaDeleteVoteForm';
import IdeaActions from '../../../actions/IdeaActions';
import { connect } from 'react-redux';

export const IdeaVoteBox = React.createClass({
  displayName: 'IdeaVoteBox',
  propTypes: {
    idea: PropTypes.object.isRequired,
    className: PropTypes.string,
    formWrapperClassName: PropTypes.string,
    user: PropTypes.object,
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
    };
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
    return this.props.user && this.props.idea.userHasVote;
  },

  render() {
    const { idea, className, formWrapperClassName, user } = this.props;
    const { isSubmitting } = this.state;
    return (
      <div className={className}>
        {
          user && <UserPreview
              user={user}
              style={{ padding: '0', marginBottom: '0', fontSize: '18px' }}
            />
        }
        <div className={formWrapperClassName}>
          {
            this.userHasVote()
            ? <IdeaDeleteVoteForm
              idea={idea}
              isSubmitting={isSubmitting}
              onSubmitSuccess={this.handleSubmitSuccess}
              onFailure={this.handleFailure}
              anonymous={!user}
            />
            : <IdeaCreateVoteForm
              idea={idea}
              isSubmitting={isSubmitting}
              onSubmitSuccess={this.handleSubmitSuccess}
              onFailure={this.handleFailure}
              anonymous={!user}
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

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(IdeaVoteBox);
