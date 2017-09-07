import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { SubmissionError } from 'redux-form';
import IdeaVoteForm from './IdeaVoteForm';
import IdeaActions from '../../../actions/IdeaActions';
import { voteSuccess } from '../../../redux/modules/idea';

const onSubmit = (values, dispatch, props) => {
  const { idea } = props;
  const data = values;
  return IdeaActions.vote(idea.id, data)
    .then(vote => {
      dispatch(voteSuccess(idea.id, vote));
    })
    .catch(error => {
      console.log(error.response.message);
      throw new SubmissionError({ email: error.response.message });
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
