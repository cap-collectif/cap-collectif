// @flow
import React from 'react';
import classNames from 'classnames';

type Props = {
  page: number,
  onSelect: ?Function,
  label: ?string,
  ariaLabel: ?string,
  disabled: boolean,
  active: boolean,
};

export default class PaginationItem extends React.Component<Props> {
  static defaultProps = {
    disabled: false,
    active: false,
    label: null,
    ariaLabel: null,
  };

  render() {
    const { active, ariaLabel, disabled, label, onSelect, page } = this.props;
    const classes = classNames({
      disabled,
      active,
    });
    return (
      <li className={classes}>
        <span
          className="page-item__wrapper"
          aria-label={ariaLabel || label || page}
          onClick={onSelect}
          role="link"
          tabIndex={page}
          onKeyPress={onSelect}>
          <span className="page-item__label" aria-hidden="true">
            {label || page}
          </span>
        </span>
      </li>
    );
  }
}

PaginationItem.displayName = 'PaginationItem';
