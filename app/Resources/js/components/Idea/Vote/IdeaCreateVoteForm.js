import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { SubmissionError } from 'redux-form';
import Fetcher, { json } from '../../../services/Fetcher';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import IdeaVoteForm from './IdeaVoteForm';
import { voteSuccess } from '../../../redux/modules/idea';
import {
  CREATE_COMMENT_SUCCESS,
  CREATE_COMMENT_FAILURE,
} from '../../../constants/CommentConstants';
import { UPDATE_ALERT } from '../../../constants/AlertConstants';

const onSubmit = (values, dispatch, props) => {
  const { idea } = props;
  const data = values;

  const hasComment = data.comment && data.comment.length > 0;
  return Fetcher.post(`/ideas/${idea.id}/votes`, data)
    .then(json)
    .then(vote => {
      AppDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'alert.success.add.vote' },
      });
      dispatch(voteSuccess(idea.id, vote));
      if (hasComment) {
        AppDispatcher.dispatch({
          actionType: CREATE_COMMENT_SUCCESS,
          message: 'comment.submit_success',
        });
      }
      return vote;
    })
    .catch(error => {
      if (
        error &&
        error.response &&
        error.response.message === 'Vous avez déjà voté pour cette idée.'
      ) {
        throw new SubmissionError({ email: 'idea.vote.form.already.voted' });
      }
      AppDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'warning', content: 'alert.danger.add.vote' },
      });
      if (hasComment) {
        AppDispatcher.dispatch({
          actionType: CREATE_COMMENT_FAILURE,
          message: 'comment.submit_error',
        });
      }
    });
};

export const IdeaCreateVoteForm = React.createClass({
  displayName: 'IdeaCreateVoteForm',

  propTypes: {
    dispatch: PropTypes.func.isRequired,
    idea: PropTypes.object.isRequired,
    anonymous: PropTypes.bool.isRequired,
  },

  render() {
    const { anonymous, idea } = this.props;
    return <IdeaVoteForm onSubmit={onSubmit} idea={idea} anonymous={anonymous} />;
  },
});

export default connect()(IdeaCreateVoteForm);
