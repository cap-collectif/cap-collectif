import React, { PropTypes } from 'react';
import classNames from 'classnames';
import RankingBlock from './RankingBlock';

const Ranking = React.createClass({
  displayName: 'Ranking',

  propTypes: {
    id: PropTypes.string.isRequired,
    field: PropTypes.object.isRequired,
    getGroupStyle: PropTypes.func.isRequired,
    renderFormErrors: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    disabled: PropTypes.bool,
    label: PropTypes.any,
    labelClassName: PropTypes.string,
    isReduxForm: PropTypes.bool.isRequired
  },

  getDefaultProps() {
    return {
      disabled: false,
      labelClassName: '',
      isReduxForm: false
    };
  },

  empty() {
    //   ¯\_(ツ)_/¯
    this.rankingBlock
      .getDecoratedComponentInstance()
      .getDecoratedComponentInstance()
      .reset();
  },

  handleRankingChange(ranking) {
    const { field, onChange, isReduxForm } = this.props;
    const values = [];
    ranking.map(item => values.push(item.label));

    if (isReduxForm) {
      onChange(values);

      return;
    }

    onChange(field, values);
  },

  render() {
    const {
      field,
      id,
      labelClassName,
      getGroupStyle,
      disabled,
      label,
      renderFormErrors
    } = this.props;
    const labelClasses = classNames({
      'control-label': true,
      [labelClassName]: true
    });
    return (
      <div className={`form-group ${getGroupStyle(field.id)}`} id={id}>
        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>
        {field.helpText ? <span className="help-block">{field.helpText}</span> : null}
        <RankingBlock
          ref={c => (this.rankingBlock = c)}
          field={field}
          disabled={disabled}
          onBlur={this.props.onBlur}
          onRankingChange={this.handleRankingChange}
        />
        {renderFormErrors(field.id)}
      </div>
    );
  }
});

export default Ranking;
