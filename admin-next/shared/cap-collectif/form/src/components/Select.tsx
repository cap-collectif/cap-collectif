import * as React from 'react';
import { useIntl } from 'react-intl';
import debounce from '../utils/debounce-promise';
import { Select as CapSelect, AsyncSelect } from '@cap-collectif/ui';

export type Option = { value: string, label: string };
export type Value = string | Array<{ value: string }> | { value: string } | Option;

const DEBOUNCE_MS = 400;

export interface SelectProps {
    placeholder?: string;
    noOptionsMessage?: string;
    loadingMessage?: string;
    isMulti?: boolean;
    options?: Array<Option>;
    loadOptions?: (search: string) => Promise<(Option | undefined)[] | undefined>;
    onChange?: (value: Value) => void;
    value?: Value | Option;
    defaultOptions?: boolean;
    clearable?: boolean;
    role?: string;
}

export const Select: React.FC<SelectProps> = ({
    loadOptions,
    options,
    onChange,
    noOptionsMessage,
    loadingMessage,
    value,
    clearable,
    ...rest
}) => {
    const intl = useIntl();
    if (loadOptions) {
        const loadOptionsDebounced = debounce(loadOptions, DEBOUNCE_MS, {
            leading: true,
        });

        return (
            <AsyncSelect
                {...rest}
                isClearable={clearable}
                value={value}
                loadOptions={loadOptionsDebounced}
                loadingMessage={() =>
                    loadingMessage || intl.formatMessage({ id: 'global.loading' })
                }
                noOptionsMessage={() =>
                    noOptionsMessage || intl.formatMessage({ id: 'result-not-found' })
                }
                placeholder={
                    rest.placeholder ||
                    intl.formatMessage({ id: 'admin.fields.menu_item.parent_empty' })
                }
                onChange={newValue => {
                    if (typeof onChange === 'function') {
                        onChange(newValue)
                    }
                }}
            />
        );
    }
    return (
        <CapSelect
            {...rest}
            isClearable={clearable}
            options={options}
            noOptionsMessage={() =>
                noOptionsMessage || intl.formatMessage({ id: 'result-not-found' })
            }
            placeholder={
                rest.placeholder ||
                intl.formatMessage({ id: 'admin.fields.menu_item.parent_empty' })
            }
            value={options?.find(option => option.value === value)}
            onChange={newValue => {
                if (typeof onChange === 'function') {
                    onChange(rest.isMulti ? newValue : newValue?.value || '');
                }
            }}
        />
    );
};

export default Select;
