// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { connect, type MapStateToProps } from 'react-redux';
import type { State } from '../../types';

type Props = {
  author: Object,
  onClick: Function,
  className: string,
  style?: Object,
  id?: string,
  user?: Object,
};

class DeleteButton extends React.Component<Props> {
  static defaultProps = {
    author: null,
    className: '',
    style: null,
    id: 'delete-button',
    user: null,
  };

  isDeletable = () => this.isTheUserTheAuthor();

  isTheUserTheAuthor = () => {
    const { author, user } = this.props;
    if (author === null || !user) {
      return false;
    }
    return user.uniqueId === author.uniqueId;
  };

  render() {
    const { className, id, onClick, style } = this.props;
    if (this.isDeletable()) {
      const classes = {
        btn: true,
        'btn-danger': true,
        'btn--outline': true,
      };
      classes[className] = true;

      return (
        <button id={id} style={style} className={classNames(classes)} onClick={() => onClick()}>
          <i className="cap cap-bin-2" />
          <FormattedMessage id="global.remove" />
        </button>
      );
    }
    return null;
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  user: state.user.user,
});

export default connect(mapStateToProps)(DeleteButton);
