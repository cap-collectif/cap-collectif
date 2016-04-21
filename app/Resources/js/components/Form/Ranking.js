import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import RankingBlock from './RankingBlock';

const Ranking = React.createClass({
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

  onChange(e, value) {
    this.reverseOnChange(value, e);
  },

  reverseOnChange(value, e) {
  },

  empty() {
  },

  render() {
    const { field, id, labelClassName, getGroupStyle } = this.props;

    const labelClasses = {
      'control-label': true,
    };
    labelClasses[labelClassName] = true;

    const optional = this.getIntlMessage('global.form.optional');

    return (
      <div
        className={'form-group ' + getGroupStyle(field.id)}
        id={id}
      >
        <label className={classNames(labelClasses)}>
          {field.question + (field.required ? '' : optional)}
        </label>
        <span className="help-block">
          {field.helpText}
        </span>
        <RankingBlock
          field={field}
          pickBoxItems={field.choices}
        />
        {this.props.renderFormErrors(field.id)}
      </div>
    );
  },

});

export default Ranking;
