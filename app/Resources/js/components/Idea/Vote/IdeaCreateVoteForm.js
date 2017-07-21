import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import IdeaActions from '../../../actions/IdeaActions';
import IdeaVoteForm from './IdeaVoteForm';
import { voteSuccess } from '../../../redux/modules/idea';

export const IdeaCreateVoteForm = React.createClass({
  displayName: 'IdeaCreateVoteForm',

  propTypes: {
    dispatch: PropTypes.func.isRequired,
    idea: PropTypes.object.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
    anonymous: PropTypes.bool.isRequired,
  },

  getInitialState() {
    return {
      serverErrors: [],
    };
  },

  componentWillReceiveProps(nextProps) {
    const {
      idea,
      anonymous,
      isSubmitting,
      onFailure,
      onSubmitSuccess,
      dispatch,
    } = this.props;
    const ideaVoteForm = this.ideaVoteForm;
    if (!isSubmitting && nextProps.isSubmitting) {
      if (ideaVoteForm.isValid()) {
        const data = ideaVoteForm.state.form;
        if (!anonymous) {
          delete data.username;
          delete data.email;
        }
        if (!idea.commentable) {
          delete data.comment;
        }
        IdeaActions.vote(idea.id, data)
          .then(vote => {
            dispatch(voteSuccess(idea.id, vote));
            onSubmitSuccess();
          })
          .catch(error => {
            if (error.response) {
              this.setServerErrors(error.response);
            }
            onFailure();
          });
        return;
      }

      onFailure();
    }
  },

  setServerErrors(error) {
    const errors = [error.message];
    this.setState({
      serverErrors: errors,
    });
  },

  render() {
    const { anonymous, idea } = this.props;
    return (
      <IdeaVoteForm
        ref={c => (this.ideaVoteForm = c)}
        idea={idea}
        serverErrors={this.state.serverErrors}
        anonymous={anonymous}
      />
    );
  },
});

export default connect()(IdeaCreateVoteForm);
