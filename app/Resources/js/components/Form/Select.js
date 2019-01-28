// @flow
import * as React from 'react';
import { HelpBlock } from 'react-bootstrap';
import Select from 'react-select';
import { injectIntl, FormattedMessage, type IntlShape } from 'react-intl';

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
  intl: IntlShape,
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

const ClearIndicator = props => {
  const {
    innerProps: { ref, ...restInnerProps },
  } = props;
  return (
    <div role="button" className="select__clear-zone" {...restInnerProps} ref={ref}>
      <i className="cap cap-times mr-10 ml-10" />
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
      intl,
      meta: { touched, error },
    } = this.props;
    const { name, value, onBlur, onFocus } = input;

    const selectLabel =
      options && options.filter(option => option && option.value && option.value === value);

    const selectValue = value ? selectLabel && selectLabel[0] : null;

    console.log(this.props);

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
              components={{ ClearIndicator }}
              isDisabled={disabled}
              defaultOptions={autoload}
              isClearable={clearable}
              placeholder={placeholder}
              loadOptions={loadOptions}
              onBlurResetsInput={false}
              onCloseResetsInput={false}
              value={selectValue}
              name={name}
              isMulti={multi}
              options={options}
              noOptionsMessage={() => <FormattedMessage id="select.no-results" />}
              loadingPlaceholder={intl.formatMessage({ id: 'global.loading' })}
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
              components={{ ClearIndicator }}
              isDisabled={disabled}
              options={options}
              filterOption={filterOptions}
              onBlurResetsInput={false}
              onCloseResetsInput={false}
              placeholder={placeholder}
              isClearable={clearable}
              isMulti={multi}
              value={selectValue}
              noOptionsMessage={() => <FormattedMessage id="select.no-results" />}
              loadingPlaceholder={intl.formatMessage({ id: 'global.loading' })}
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

export default injectIntl(renderSelect);
