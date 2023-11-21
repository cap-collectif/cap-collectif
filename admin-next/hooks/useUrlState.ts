import { useState } from 'react';

export const clearQueryUrl = (url: URL): URL => {
    url.href = url.href.replace(url.search, '');
    return url;
};

type UseStateQueryResult = [string, (value: string) => void];

export function useUrlState(key: string, defaultValue: string): UseStateQueryResult {
    const url = new URL(window.location.href);
    const initialValue = url.searchParams.get(key);
    const value = initialValue ?? defaultValue;

    const handleValue = (value: string) => {
        url.searchParams.set(key, value);
        window.history.replaceState(null, '', url.toString());
    };

    return [value, handleValue];
}

export default useUrlState;
