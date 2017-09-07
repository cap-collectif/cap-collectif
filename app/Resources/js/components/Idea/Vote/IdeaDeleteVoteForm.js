import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import IdeaVoteForm from './IdeaVoteForm';
import IdeaActions from '../../../actions/IdeaActions';
import { deleteVoteSucceeded } from '../../../redux/modules/idea';

const onSubmit = (values, dispatch, props) => {
  const { idea } = props;
  const data = values;
  return IdeaActions.deleteVote(idea.id, data).then(deleteVote => {
    dispatch(deleteVoteSucceeded(idea.id, deleteVote));
  });
};

export const IdeaDeleteVoteForm = React.createClass({
  displayName: 'IdeaDeleteVoteForm',

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

export default connect()(IdeaDeleteVoteForm);
