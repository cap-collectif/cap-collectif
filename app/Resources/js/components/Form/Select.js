// @flow
import React, { PropTypes } from 'react';
import Select from 'react-select';

export const renderSelect = React.createClass({
  propTypes: {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    touched: PropTypes.bool,
    label: PropTypes.any.isRequired,
    id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    error: PropTypes.any,
    options: PropTypes.array,
    clearable: PropTypes.bool,
    multi: PropTypes.bool,
    loadOptions: PropTypes.func,
    filterOptions: PropTypes.func,
    isLoading: PropTypes.bool,
    onChange: PropTypes.func,
    labelClassName: PropTypes.string,
    inputClassName: PropTypes.string,
  },

  render() {
    const {
      onChange,
      input,
      label,
      labelClassName,
      inputClassName,
      meta: { touched, error },
      ...custom
    } = this.props;
    const reactSelectToReduxForm = (event: Event) => {
      if (input.onChange) {
        input.onChange(
          Array.isArray(event)
            ? event.map(e => e.value || [])
            : (event && event.value) || null,
        );
      }
      if (typeof onChange === 'function') {
        onChange();
      }
    };
    return (
      <div className="form-group">
        {label &&
          <label
            htmlFor={input.name}
            className={labelClassName || 'col-sm-2 control-label'}>
            {label}
          </label>}
        <div id={input.name} className={inputClassName || 'col-sm-10'}>
          {typeof custom.loadOptions === 'function'
            ? <Select.Async
                {...input}
                {...custom}
                noResultsText={'En attente de résultats...'}
                onBlur={() => {
                  input.onBlur(input.value);
                }}
                onChange={reactSelectToReduxForm}
              />
            : <Select
                {...input}
                {...custom}
                noResultsText={'En attente de résultats...'}
                onBlur={() => input.onBlur(input.value)}
                onChange={reactSelectToReduxForm}
              />}
          {touched && error}
        </div>
      </div>
    );
  },
});

export default renderSelect;
