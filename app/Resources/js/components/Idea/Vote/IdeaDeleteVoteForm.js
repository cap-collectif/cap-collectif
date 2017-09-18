// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import IdeaVoteForm from './IdeaVoteForm';
import Fetcher, { json } from '../../../services/Fetcher';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import { deleteVoteSucceeded } from '../../../redux/modules/idea';
import { UPDATE_ALERT } from '../../../constants/AlertConstants';

type Props = {
  dispatch: Function,
  idea: Object,
  anonymous: boolean,
};

const onSubmit = (values, dispatch, props) => {
  // eslint-disable-next-line react/prop-types
  const { idea } = props;

  return Fetcher.delete(`/ideas/${idea.id}/votes`)
    .then(json)
    .then(vote => {
      AppDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'alert.success.delete.vote' },
      });
      dispatch(deleteVoteSucceeded(idea.id, vote));
      return vote;
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'warning', content: 'alert.danger.delete.vote' },
      });
      return false;
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
