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
    label: PropTypes.any.isRequired,
    id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    autoload: PropTypes.bool,
    clearable: PropTypes.bool,
    disabled: PropTypes.bool,
    multi: PropTypes.bool,
    options: PropTypes.array, // or loadOptions for async
    loadOptions: PropTypes.func, // or options for sync
    filterOptions: PropTypes.func,
    onChange: PropTypes.func,
    labelClassName: PropTypes.string,
    inputClassName: PropTypes.string,
  },

  getDefaultProps() {
    return {
      multi: false,
      disabled: false,
      autoload: false,
      clearable: true,
      loadOptions: undefined,
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
      disabled,
      autoload,
      clearable,
      placeholder,
      loadOptions,
      filterOptions,
      meta: { touched, error },
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
          {typeof loadOptions === 'function'
            ? <Select.Async
                filterOptions={filterOptions}
                disabled={disabled}
                autoload={autoload}
                clearable={clearable}
                placeholder={placeholder}
                loadOptions={loadOptions}
                valueKey="value"
                value={value}
                name={name}
                multi={multi}
                options={options}
                noResultsText={'Pas de résultats…'}
                loadingPlaceholder={'Chargement…'}
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
                disabled={disabled}
                options={options}
                filterOptions={filterOptions}
                placeholder={placeholder}
                loadOptions={loadOptions}
                valueKey="value"
                clearable={clearable}
                autoload={autoload}
                multi={multi}
                value={value}
                noResultsText={'Pas de résultats…'}
                loadingPlaceholder={'Chargement…'}
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
