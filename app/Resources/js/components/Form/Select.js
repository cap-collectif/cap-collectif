// @flow
import * as React from 'react';
import { HelpBlock } from 'react-bootstrap';
import Select from 'react-select';

type Options = Array<{ value: string, label: string }>;
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

const CustomClearText = () => 'clear all';
const ClearIndicator = props => {
  const {
    children = <CustomClearText />,
    innerProps: { ref, ...restInnerProps },
  } = props;
  return (
    <div {...restInnerProps} ref={ref}>
      <div style={{ padding: '0px 5px' }}>{children}</div>
    </div>
  );
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

    const selectLabel =
      options && options.filter(option => option && option.value && option.value === value);

    const selectValue = value ? selectLabel && selectLabel[0] : null;

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
              filterOption={filterOptions}
              // components={{ ClearIndicator }}
              // styles={{ clearIndicator: ClearIndicatorStyles }}
              isDisabled={disabled}
              defaultOptions={autoload}
              isClearable
              // isClearable={clearable}
              placeholder={placeholder}
              loadOptions={loadOptions}
              onBlurResetsInput={false}
              onCloseResetsInput={false}
              // valueKey="value"
              // value={value}
              name={name}
              isMulti={multi}
              options={options}
              noOptionsMessage={() => 'Pas de résultats…'}
              // loadingPlaceholder="Chargement…"
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
              // defaultValue={options[1]}
              components={{ ClearIndicator }}
              // styles={{ clearIndicator: ClearIndicatorStyles }}
              isDisabled={disabled}
              options={options}
              // filterOption={filterOptions}
              onBlurResetsInput={false}
              onCloseResetsInput={false}
              placeholder={placeholder}
              // loadOptions={loadOptions}
              isClearable={clearable}
              // autoload={autoload}
              isMulti={multi}
              value={selectValue}
              // inputValue={input.value}
              noOptionsMessage={() => 'Pas de résultats…'}
              // loadingPlaceholder="Chargement…"
              onBlur={onBlur}
              onFocus={onFocus}
              onChange={(newValue: OnChangeInput) => {
                console.log(newValue);
                // if (typeof onChange === 'function') {
                //   onChange();
                // }
                if (multi && Array.isArray(newValue)) {
                  return input.onChange(newValue);
                }
                if (!Array.isArray(newValue)) {
                  console.log('test');
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
