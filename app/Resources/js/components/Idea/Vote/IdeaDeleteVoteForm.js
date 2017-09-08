// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import IdeaVoteForm from './IdeaVoteForm';
import IdeaActions from '../../../actions/IdeaActions';
import { deleteVoteSucceeded } from '../../../redux/modules/idea';

type Props = {
  dispatch: Function,
  idea: Object,
  anonymous: boolean,
};

const onSubmit = (values, dispatch, props) => {
  // eslint-disable-next-line react/prop-types
  const { idea } = props;
  const data = values;
  return IdeaActions.deleteVote(idea.id, data).then(deleteVote => {
    dispatch(deleteVoteSucceeded(idea.id, deleteVote));
  });
};

export class IdeaDeleteVoteForm extends React.Component<Props> {
  displayName: 'IdeaDeleteVoteForm';

  render() {
    // eslint-disable-next-line react/prop-types
    const { anonymous, idea } = this.props;
    return <IdeaVoteForm onSubmit={onSubmit} idea={idea} anonymous={anonymous} />;
  }
}

export default connect()(IdeaDeleteVoteForm);
