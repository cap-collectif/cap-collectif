// @flow
import React from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

type Props = {
  type: string,
  onClick?: Function,
  disabled?: boolean,
};

class RankingArrow extends React.Component<Props> {
  static displayName = 'RankingArrow';

  static defaultProps = {
    disabled: false,
    onClick: null,
  };

  render() {
    const { type, onClick, disabled } = this.props;
    const classes = classNames({
      cap: true,
      'cap-delete-1': type === 'left',
      'cap-arrow-2-1': type === 'right',
      'cap-arrow-67': type === 'down',
      'cap-arrow-68': type === 'up',
    });
    return (
      <Button
        disabled={disabled}
        onClick={disabled ? null : onClick}
        className={`ranking__item__arrow ranking__item__arrow--${type}`}>
        {type === 'right' && (
          <span className="hidden-xs" style={{ marginRight: '10px' }}>
            {<FormattedMessage id="global.form.ranking.select" />}
          </span>
        )}
        <i className={classes} />
      </Button>
    );
  }
}

export default RankingArrow;
