import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
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
    disabled: PropTypes.bool,
    labelClassName: PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      disabled: false,
      labelClassName: '',
    };
  },

  empty() {
    //   ¯\_(ツ)_/¯
    this.rankingBlock
      .getDecoratedComponentInstance()
      .getDecoratedComponentInstance()
      .reset()
    ;
  },

  handleRankingChange(ranking) {
    const values = [];
    ranking.map(item => values.push(item.label));
    this.props.onChange(this.props.field, values);
  },

  render() {
    const { field, id, labelClassName, getGroupStyle, disabled } = this.props;
    const labelClasses = classNames({
      'control-label': true,
      [labelClassName]: true,
    });
    const optional = this.getIntlMessage('global.form.optional');

    return (
      <div
        className={`form-group ${getGroupStyle(field.id)}`}
        id={id}
      >
        <label className={labelClasses}>
          {field.question + (field.required ? '' : optional)}
        </label>
        {
          field.helpText
          ? <span className="help-block">
            {field.helpText}
          </span>
          : null
        }
        <RankingBlock
          ref={c => this.rankingBlock = c}
          field={field}
          disabled={disabled}
          onRankingChange={this.handleRankingChange}
        />
        {this.props.renderFormErrors(field.id)}
      </div>
    );
  },

});

export default Ranking;
