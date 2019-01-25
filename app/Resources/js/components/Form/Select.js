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

// const CustomClearText = () => 'clear all';
// const ClearIndicator = (props) => {
//   const { children = <CustomClearText/>, getStyles, innerProps: { ref, ...restInnerProps } } = props;
//   return (
//     <div {...restInnerProps} ref={ref} style={getStyles('clearIndicator', props)}>
//       <div style={{ padding: '0px 5px' }}>
//         {children}
//       </div>
//     </div>
//   );
// };
// const ClearIndicatorStyles = (base, state) => ({
//   ...base,
//   cursor: 'pointer',
//   color: state.isFocused ? 'blue' : 'black',
// });

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

    console.log(this.props.input.value, this.props);

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
              // placeholder={placeholder}
              loadOptions={loadOptions}
              // valueKey="value"
              value={value}
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
              // components={{ ClearIndicator }}
              // styles={{ clearIndicator: ClearIndicatorStyles }}
              isDisabled={disabled}
              options={options}
              filterOption={filterOptions}
              placeholder={placeholder}
              loadOptions={loadOptions}
              // valueKey="value"
              isClearable={clearable}
              // autoload={autoload}
              isMulti={multi}
              value={value}
              onSelectResetsInput={false}
              // inputValue={input.value}
              noOptionsMessage={() => 'Pas de résultats…'}
              // loadingPlaceholder="Chargement…"
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
