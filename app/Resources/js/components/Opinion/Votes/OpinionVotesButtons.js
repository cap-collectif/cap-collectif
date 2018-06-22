// @flow
import React from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import OpinionVotesButton from './OpinionVotesButton';
import type { State } from '../../../types';

type Props = {
  opinion: Object,
  show: boolean,
  disabled: boolean,
  user?: Object,
};

class OpinionVotesButtons extends React.Component<Props> {
  static defaultProps = {
    user: null,
  };

  isTheUserTheAuthor = () => {
    const { opinion, user } = this.props;
    if (opinion.author === null || !user) {
      return false;
    }
    return user.uniqueId === opinion.author.uniqueId;
  };

  render() {
    const { opinion, disabled, show } = this.props;
    if (!show) {
      return null;
    }
    return (
      <ButtonToolbar className="opinion__votes__buttons">
        <OpinionVotesButton disabled={disabled} opinion={opinion} value={1} />
        <OpinionVotesButton
          disabled={disabled}
          style={{ marginLeft: 5 }}
          opinion={opinion}
          value={0}
        />
        <OpinionVotesButton
          disabled={disabled}
          style={{ marginLeft: 5 }}
          opinion={opinion}
          value={-1}
        />
      </ButtonToolbar>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  user: state.user.user,
});

export default connect(mapStateToProps)(OpinionVotesButtons);
