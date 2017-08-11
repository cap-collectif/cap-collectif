// @flow
import React, { PropTypes } from 'react';
import Select from 'react-select';

export const renderSelect = React.createClass({
  propTypes: {
    input: PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
      onBlur: PropTypes.func.isRequired,
      onChange: PropTypes.func.isRequired,
      onFocus: PropTypes.func.isRequired,
    }).isRequired,
    meta: PropTypes.object.isRequired,
    touched: PropTypes.bool,
    label: PropTypes.any.isRequired,
    id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    error: PropTypes.any,
    options: PropTypes.array.isRequired,
    clearable: PropTypes.bool,
    multi: PropTypes.bool,
    loadOptions: PropTypes.func,
    filterOptions: PropTypes.func,
    isLoading: PropTypes.bool,
    onChange: PropTypes.func,
    labelClassName: PropTypes.string,
    inputClassName: PropTypes.string,
  },

  getDefaultProps() {
    return {
      multi: false,
    };
  },

  render() {
    const {
      onChange,
      input,
      label,
      labelClassName,
      inputClassName,
      multi,
      options,
      meta: { touched, error },
      ...custom
    } = this.props;
    const { name, value, onBlur, onFocus } = input;
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
                autoload
                loadOptions={custom.loadOptions}
                valueKey="value"
                value={value}
                name={name}
                multi={multi}
                noResultsText={'En attente de résultats...'}
                onBlur={() => onBlur(value)}
                onFocus={onFocus}
                onChange={(newValue: string | Array<Object>) => {
                  if (typeof onChange === 'function') {
                    onChange();
                  }
                  if (multi) {
                    return input.onChange(newValue);
                  }
                  input.onChange(newValue ? newValue.value : '');
                }}
              />
            : <Select
                name={name}
                valueKey="value"
                multi={multi}
                value={value}
                noResultsText={'En attente de résultats...'}
                onBlur={() => onBlur(value)}
                onFocus={onFocus}
                onChange={(newValue: { value: string }) => {
                  if (typeof onChange === 'function') {
                    onChange();
                  }
                  if (multi) {
                    return input.onChange(newValue);
                  }
                  input.onChange(newValue ? newValue.value : '');
                }}
              />}
          {touched && error}
        </div>
      </div>
    );
  },
});

export default renderSelect;
