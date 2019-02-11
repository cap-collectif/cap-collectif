// @flow
import * as React from 'react';
import { HelpBlock } from 'react-bootstrap';
import Select from 'react-select';

type Options = Array<{ id: string, label: string }>;
type Value = string | Array<{ value: string }>;
type OnChangeInput = { value: string } | Array<{ value: string }>;
type Props = {
  input: {
    name: string,
    value: Value,
    onBlur: () => void,
    onChange: (value: Value) => void,
    onFocus: () => void,
  },
  id: string,
  meta: { touched: boolean, error: ?string },
  label: string | React.Node,
  help: string | React.Node,
  placeholder?: string,
  autoload?: boolean,
  clearable?: boolean,
  disabled?: boolean,
  multi: boolean,
  options?: Options, // or loadOptions for async
  loadOptions?: () => Options, // or options for sync
  filterOptions?: Function,
  onChange: () => void,
  labelClassName?: string,
  inputClassName?: string,
};

export class renderSelect extends React.Component<Props> {
  static defaultProps = {
    multi: false,
    disabled: false,
    autoload: false,
    clearable: true,
  };

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
      id,
      help,
      meta: { touched, error },
    } = this.props;
    const { name, value, onBlur, onFocus } = input;
    return (
      <div className="form-group">
        {label && (
          <label htmlFor={id} className={labelClassName || 'control-label'}>
            {label}
          </label>
        )}
        {help && <HelpBlock>{help}</HelpBlock>}
        <div id={id} className={inputClassName || ''}>
          {typeof loadOptions === 'function' ? (
            <Select.Async
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
              noResultsText="Pas de résultats…"
              loadingPlaceholder="Chargement…"
              onBlur={() => onBlur()}
              onFocus={onFocus}
              onChange={(newValue: OnChangeInput) => {
                if (typeof onChange === 'function') {
                  onChange();
                }
                if (multi && Array.isArray(newValue)) {
                  input.onChange(newValue);
                  return;
                }
                if (!Array.isArray(newValue)) {
                  input.onChange(newValue ? newValue.value : '');
                }
              }}
            />
          ) : (
            <Select
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
              noResultsText="Pas de résultats…"
              loadingPlaceholder="Chargement…"
              onBlur={() => onBlur()}
              onFocus={onFocus}
              onChange={(newValue: OnChangeInput) => {
                if (typeof onChange === 'function') {
                  onChange();
                }
                if (multi && Array.isArray(newValue)) {
                  return input.onChange(newValue);
                }
                if (!Array.isArray(newValue)) {
                  input.onChange(newValue ? newValue.value : '');
                }
              }}
            />
          )}
          {touched && error}
        </div>
      </div>
    );
  }
}

export default renderSelect;
