import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

const RankingArrow = React.createClass({
  displayName: 'RankingArrow',
  propTypes: {
    type: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      disabled: false,
    };
  },

  render() {
    const { type, onClick, disabled } = this.props;
    const classes = classNames({
      'cap': true,
      'cap-arrow-65': type === 'left',
      'cap-arrow-66': type === 'right',
      'cap-arrow-67': type === 'down',
      'cap-arrow-68': type === 'up',
    });
    return (
      <Button
        disabled={disabled}
        onClick={disabled ? null : onClick}
        className={'ranking__item__arrow ranking__item__arrow--' + type}
      >
        <i className={classes}></i>
      </Button>
    );
  },

});

export default RankingArrow;
