// @flow
import * as React from 'react';
import debounce from 'debounce-promise';
import type { Props as DropdownSelectProps } from '~ui/DropdownSelect';
import DropdownSelect from '~ui/DropdownSelect';
import { SearchableDropdownSelectContext } from './context';
import { createReducer } from './reducer';
import * as S from './style';
import type { Action, State } from '~ui/SearchableDropdownSelect/reducer';
import Loader from '~ui/FeedbacksIndicators/Loader';
import DropdownSelectMessage from '~ui/DropdownSelect/message';

type Props = {|
  ...DropdownSelectProps,
  +debounceMs?: number,
  +noResultsMessage: string,
  +searchPlaceholder: string,
  +clearChoice?: {|
    +onClear?: () => void,
    +enabled?: boolean,
    +message?: string,
  |},
  +message?: React.Element<typeof DropdownSelectMessage>,
  +searchInputIcon?: React.Node,
  +defaultOptions?: $ReadOnlyArray<any>,
  +loadOptions: (terms: string) => Promise<$ReadOnlyArray<any>>,
  +children: (results: $ReadOnlyArray<any>) => React.Node,
|};

const SearchableDropdownSelect = ({
  children,
  loadOptions,
  defaultOptions,
  clearChoice,
  searchInputIcon,
  noResultsMessage,
  searchPlaceholder,
  debounceMs = 400,
  message,
  ...rest
}: Props) => {
  const [state, dispatch] = React.useReducer<State, Action>(createReducer, {
    status: 'default',
    error: null,
    results: [],
  });

  const context = React.useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state],
  );

  const onChange = debounce(
    async e => {
      try {
        if (e.target.value === '') {
          dispatch({ type: 'RESET' });
        } else {
          dispatch({ type: 'FETCH_INIT' });
          const results = await loadOptions(e.target.value);
          dispatch({ type: 'FETCH_SUCCESS', payload: results });
        }
      } catch (error) {
        dispatch({ type: 'FETCH_ERROR', payload: error });
        // eslint-disable-next-line no-console
        console.error(error);
      }
    },
    debounceMs,
    { leading: debounceMs === 0 },
  );
  return (
    <SearchableDropdownSelectContext.Provider value={context}>
      <S.SearchableDropdownContainer {...rest}>
        {message}
        <DropdownSelect.Header>
          <S.Input
            icon={searchInputIcon}
            placeholder={searchPlaceholder}
            type="text"
            onClear={() => {
              dispatch({ type: 'RESET' });
            }}
            onChange={e => {
              e.persist();
              onChange(e);
            }}
          />
        </DropdownSelect.Header>
        {state.status === 'loading' && (
          <S.MessageContainer>
            <Loader show inline />
          </S.MessageContainer>
        )}
        {state.status === 'no_result' && (
          <S.MessageContainer>{noResultsMessage}</S.MessageContainer>
        )}
        {state.status === 'default' && (
          <React.Fragment>
            {clearChoice?.enabled && (
              <DropdownSelect.Choice
                key="clear"
                emitChange={false}
                onClick={clearChoice?.onClear}
                value="CLEAR">
                {clearChoice?.message || ''}
              </DropdownSelect.Choice>
            )}
            {defaultOptions && state.results.length === 0
              ? children(defaultOptions)
              : children(state.results)}
          </React.Fragment>
        )}
      </S.SearchableDropdownContainer>
    </SearchableDropdownSelectContext.Provider>
  );
};

export default SearchableDropdownSelect;
