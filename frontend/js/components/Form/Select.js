// @flow
import * as React from 'react';
import styled, { css, type StyledComponent } from 'styled-components';
import Select, { components } from 'react-select';
import cn from 'classnames';
import Async from 'react-select/async';
import { FormattedMessage, type IntlShape, useIntl } from 'react-intl';
import debouncePromise from 'debounce-promise';
import { TYPE_FORM } from '~/constants/FormConstants';
import Help from '~/components/Ui/Form/Help/Help';
import Label from '~/components/Ui/Form/Label/Label';
import Description from '~ui/Form/Description/Description';
import isQuestionnaire from '~/utils/isQuestionnaire';
import colors from '~/styles/modules/colors';

export type Option = { value: string, label: string };
export type Options = Array<Option> | Array<{ label: string, options: Array<Option> }>;
export type ReactSelectValue = { value: string, label: string };
type Value = string | Array<{ value: string }> | ReactSelectValue;
type OnChangeInput = Array<{ value: string }>;
type AriaLiveMessage = {|
  onFocus?: ({ context: 'menu' | 'value', label: $PropertyType<Option, 'label'> }) => string,
  onChange?: ({
    action:
      | 'select-option'
      | 'deselect-option'
      | 'remove-value'
      | 'pop-value'
      | 'set-value'
      | 'clear'
      | 'create-option',
    label: $PropertyType<Option, 'label'>,
  }) => string,
  guidance?: ({ context: 'menu' | 'input' | 'value' }) => string,
  onFilter?: ({ inputValue: string, resultsMessage: string }) => string,
|};

type Error =
  | string
  | {
      id: string,
      values: any,
    };

type Props = {
  input: {
    name: string,
    value: Value,
    onBlur: () => void,
    onChange: (value: Value) => void,
    onFocus: () => void,
  },
  id: string,
  meta: { touched: boolean, error: ?Error },
  label: string | React.Node,
  help: string | React.Node,
  placeholder?: string,
  autoload?: boolean,
  clearable?: boolean,
  searchable?: boolean,
  controlShouldRenderValue?: boolean,
  disabled?: boolean,
  multi: boolean,
  grouped: boolean,
  displayError: boolean,
  options?: Options, // or loadOptions for async
  loadOptions?: () => Options, // or options for sync
  filterOption?: Function,
  onChange: () => void,
  onBlur?: () => void,
  onFocus?: () => void,
  labelClassName?: string,
  inputClassName?: string,
  blockClassName?: string,
  divClassName?: string,
  selectFieldIsObject?: boolean,
  debounce?: boolean, // add delay in async load
  debounceMs?: number,
  cacheOptions?: boolean,
  description?: string,
  typeForm?: $Values<typeof TYPE_FORM>,
  buttonAfter?: {
    label: string | React.Node,
    onClick: () => void,
  },
  selectInputProps?: { readOnly?: boolean },
  noOptionsMessage?: string,
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

const MenuList = props => {
  const { selectProps } = props;
  return (
    <div id={selectProps.menuListId ? `${selectProps.menuListId}-menuList` : undefined}>
      <components.MenuList {...props} />
    </div>
  );
};

export const SelectContainer: StyledComponent<
  { hasButtonAfter?: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'select-container',
})`
  ${props =>
    props.hasButtonAfter &&
    css`
      display: flex;
      flex-direction: row;

      .react-select-container {
        flex: 1;

        .react-select__control {
          border-radius: 4px 0 0 4px;
          border-right: none;
        }
      }

      .btn-after {
        border: 1px solid hsl(0, 0%, 80%);
        background-color: #fff;
        border-radius: 0 4px 4px 0;
        padding: 0 8px;
      }
    `}
`;

// Accessibility message
const ariaLiveMessage = (intl: IntlShape): AriaLiveMessage => ({
  onFocus: ({ context, label }) =>
    context === 'menu'
      ? intl.formatMessage(
          {
            id: 'aria-select-on-label-focus',
          },
          { label },
        )
      : '',
  onChange: ({ action, label }) => {
    if (action === 'select-option')
      return intl.formatMessage(
        {
          id: 'aria-select-on-label-change',
        },
        { label },
      );
    if (action === 'clear') return intl.formatMessage({ id: 'aria-select-empty-field' });
    return '';
  },
  guidance: ({ context }) =>
    context === 'input' ? intl.formatMessage({ id: 'aria-select-guide' }) : '',
  onFilter: ({ inputValue, resultsMessage }) => {
    if (inputValue) {
      const extractedNumbers: ?Array<string> = resultsMessage.match(/[0-9]+/g);
      const numberOfResults = extractedNumbers ? parseInt(extractedNumbers[0], 10) : 0;

      if (numberOfResults === 0)
        return intl.formatMessage(
          {
            id: 'aria-select-no-result-with-value',
          },
          { value: inputValue },
        );
      return intl.formatMessage(
        {
          id: 'aria-select-no-result-with-value',
        },
        { count: numberOfResults, value: inputValue },
      );
    }

    return '';
  },
});

const RenderSelect = ({
  onChange,
  onBlur,
  onFocus,
  input,
  label,
  labelClassName,
  divClassName,
  inputClassName,
  blockClassName = '',
  multi = false,
  grouped = false,
  displayError = true,
  disabled = false,
  autoload = false,
  debounce = false,
  cacheOptions = false,
  clearable = true,
  options,
  searchable = true,
  controlShouldRenderValue = true,
  placeholder,
  loadOptions,
  filterOption,
  selectFieldIsObject,
  id,
  help,
  meta: { error },
  description,
  typeForm,
  buttonAfter,
  noOptionsMessage = 'result-not-found',
  debounceMs = 1300,
  meta,
  selectInputProps,
}: Props): React.Node => {
  const { name, value } = input;
  const intl = useIntl();
  const debouncedLoadOptions = debouncePromise(loadOptions, debounceMs, {
    leading: true,
  });
  const canValidate = (meta.touched && !isQuestionnaire(typeForm)) || isQuestionnaire(typeForm);
  let selectValue = null;
  let selectLabel = null;
  if (typeof loadOptions === 'function') {
    selectValue = value;
  } else if (multi) {
    selectLabel =
      options &&
      // $FlowFixMe cause option can be both type
      options.filter(option => Array.isArray(value) && value.some(o => o.value === option.value));
    selectValue = value !== undefined || value !== null ? selectLabel && selectLabel : [];
  } else if (Object.prototype.hasOwnProperty.call(value, 'value')) {
    // Here, we are dealing with a select question that uses `react-select`.
    // React select option choice must have the shape { value: xxx, label: xxx } in Redux to work
    // See https://www.firehydrant.io/blog/using-react-select-with-redux-form/ (part: `Other Gotchas`)
    selectLabel =
      options &&
      options.filter(
        option => option && option.value && option.value === ((value: any): ReactSelectValue).value,
      );
    selectValue = value && value.value ? selectLabel && selectLabel[0] : null;
  } else if (grouped && options) {
    options.map(selectGroup => {
      if (!selectGroup && !selectGroup.options) {
        return;
      }
      // $FlowFixMe because options can be both 2 types
      selectGroup.options.filter(opt => {
        if (opt.value === value) {
          selectValue = opt;
        }
      });
    });
  } else {
    selectLabel =
      options && options.filter(option => option && option.value && option.value === value);
    selectValue = value !== undefined || value !== null ? selectLabel && selectLabel[0] : null;
  }
  const component = (
    <div
      className={cn('form-group', blockClassName, {
        'has-error': canValidate && displayError && error,
      })}>
      {label && (
        <Label
          htmlFor={id}
          className={labelClassName || 'control-label'}
          id={`label-select-${id}`}
          type="label">
          {label}
        </Label>
      )}

      {description && <Description typeForm={typeForm}>{description}</Description>}

      {help && <Help typeForm={typeForm}>{help}</Help>}

      <div id={id} className={inputClassName || ''}>
        <SelectContainer hasButtonAfter={!!buttonAfter}>
          {typeof loadOptions === 'function' ? (
            <Async
              inputProps={selectInputProps}
              filterOption={filterOption}
              components={{ ClearIndicator, MenuList }}
              isDisabled={disabled}
              defaultOptions={autoload}
              isClearable={clearable}
              placeholder={
                placeholder || <FormattedMessage id="admin.fields.menu_item.parent_empty" />
              }
              loadOptions={debounce ? inputValue => debouncedLoadOptions(inputValue) : loadOptions}
              cacheOptions={cacheOptions}
              value={selectValue || ''}
              className="react-select-container"
              classNamePrefix="react-select"
              name={name}
              isMulti={multi}
              noOptionsMessage={() => <FormattedMessage id={noOptionsMessage} />}
              loadingMessage={() => <FormattedMessage id="global.loading" />}
              onBlur={onBlur}
              aria-labelledby={`label-select-${id}`}
              ariaLiveMessages={ariaLiveMessage(intl)}
              onFocus={onFocus}
              menuPortalTarget={document?.body}
              menuListId={id}
              styles={{
                menuPortal: base => ({
                  ...base,
                  zIndex: 1300,
                }),
                option: base => ({
                  ...base,
                  '&:hover,&[class*="is-focused"]': {
                    backgroundColor: colors.gray['100'],
                  },
                  '&[class*="is-selected"]': { backgroundColor: '#2484FF' },
                  borderBottom: `1px solid ${colors.gray['200']}`,
                  '&:last-child': { borderBottom: 'none' },
                }),
              }}
              menuShouldBlockScroll
              onChange={(newValue: OnChangeInput) => {
                if (typeof onChange === 'function') {
                  onChange();
                }
                if ((multi && Array.isArray(newValue)) || selectFieldIsObject) {
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
              inputProps={selectInputProps}
              components={{ ClearIndicator, MenuList }}
              isDisabled={disabled}
              className="react-select-container"
              classNamePrefix="react-select"
              options={options}
              filterOption={filterOption}
              onBlurResetsInput={false}
              onCloseResetsInput={false}
              placeholder={
                placeholder || <FormattedMessage id="admin.fields.menu_item.parent_empty" />
              }
              isClearable={clearable}
              isSearchable={searchable}
              isMulti={multi}
              controlShouldRenderValue={controlShouldRenderValue}
              value={selectValue || ''}
              noOptionsMessage={() => <FormattedMessage id="result-not-found" />}
              loadingMessage={() => <FormattedMessage id="global.loading" />}
              onBlur={onBlur}
              aria-labelledby={`label-select-${id}`}
              ariaLiveMessages={ariaLiveMessage(intl)}
              onFocus={onFocus}
              menuPortalTarget={document?.body}
              menuListId={id}
              styles={{
                menuPortal: base => ({
                  ...base,
                  zIndex: 1300,
                }),
                option: base => ({
                  ...base,
                  '&:hover,&[class*="is-focused"]': {
                    backgroundColor: colors.gray['100'],
                  },
                  '&[class*="is-selected"]': { backgroundColor: '#2484FF' },
                  borderBottom: `1px solid ${colors.gray['200']}`,
                  '&:last-child': { borderBottom: 'none' },
                }),
              }}
              menuShouldBlockScroll
              onChange={(newValue: OnChangeInput) => {
                if (typeof onChange === 'function') {
                  onChange();
                }
                if (grouped && !Array.isArray(newValue)) {
                  input.onChange(newValue ? newValue.value : '');
                }
                if ((multi && Array.isArray(newValue)) || selectFieldIsObject) {
                  return input.onChange(newValue);
                }
                if (!Array.isArray(newValue)) {
                  input.onChange(newValue ? newValue.value : '');
                }
              }}
            />
          )}

          {buttonAfter && (
            <button
              type="button"
              className="btn-after"
              onClick={buttonAfter.onClick}
              disabled={!selectValue}>
              {buttonAfter.label}
            </button>
          )}
        </SelectContainer>

        {canValidate && error && displayError && (
          <span className="error-block">
            {typeof error === 'string' && <FormattedMessage id={error} />}
            {typeof error === 'object' && (
              <FormattedMessage id={error.id} values={error.values || undefined} />
            )}
          </span>
        )}
      </div>
    </div>
  );

  if (divClassName) {
    return <div className={divClassName}>{component}</div>;
  }

  return component;
};

export default RenderSelect;
