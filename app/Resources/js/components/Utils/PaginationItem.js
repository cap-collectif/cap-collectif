import React from 'react';
import classNames from 'classnames';

export default class PaginationItem extends React.Component {
  render() {
    const { active, ariaLabel, disabled, label, onSelect, page } = this.props;
    const classes = classNames({
      disabled,
      active
    });
    return (
      <li className={classes}>
        <span
          className="page-item__wrapper"
          aria-label={ariaLabel || label || page}
          onClick={onSelect}>
          <span className="page-item__label" aria-hidden="true">
            {label || page}
          </span>
        </span>
      </li>
    );
  }
}

PaginationItem.propTypes = {
  page: React.PropTypes.number.isRequired,
  onSelect: React.PropTypes.func,
  label: React.PropTypes.string,
  ariaLabel: React.PropTypes.string,
  disabled: React.PropTypes.bool,
  active: React.PropTypes.bool
};

PaginationItem.defaultProps = {
  disabled: false,
  active: false,
  label: null,
  ariaLabel: null
};

PaginationItem.displayName = 'PaginationItem';
