import * as React from 'react'
import isEqual from 'lodash/isEqual'
import debounce from 'debounce-promise'
import type { Props as DropdownSelectProps } from '~ui/DropdownSelect'
import DropdownSelect from '~ui/DropdownSelect'
import { SearchableDropdownSelectContext } from './context'
import { createReducer } from './reducer'
import * as S from './style'
import type { Action, State } from '~ui/SearchableDropdownSelect/reducer'
import Loader from '~ui/FeedbacksIndicators/Loader'
import DropdownSelectMessage from '~ui/DropdownSelect/message'
type Props = DropdownSelectProps & {
  readonly debounceMs?: number
  readonly noResultsMessage: string
  readonly searchPlaceholder: string
  readonly clearChoice?: {
    readonly onClear?: () => void | Promise<any>
    readonly enabled?: boolean
    readonly message?: string
  }
  readonly resetChoice?: {
    readonly onReset?: () => void
    readonly enabled?: boolean
    readonly disabled?: boolean
    readonly message?: string
  }
  readonly message?: React.ReactElement<typeof DropdownSelectMessage>
  readonly searchInputIcon?: JSX.Element | JSX.Element[] | string
  readonly defaultOptions?: ReadonlyArray<any>
  readonly options?: ReadonlyArray<any>
  readonly onChangeSearch?: (terms: string) => void
  readonly loadOptions?: (terms: string) => Promise<ReadonlyArray<any>>
  readonly children: (results: ReadonlyArray<any>) => React.ReactNode
}

const SearchableDropdownSelect = ({
  children,
  loadOptions,
  defaultOptions,
  options,
  clearChoice,
  resetChoice,
  searchInputIcon,
  noResultsMessage,
  searchPlaceholder,
  debounceMs = 400,
  message,
  onChangeSearch,
  disabled,
  ...rest
}: Props) => {
  const [state, dispatch] = React.useReducer<State, Action>(createReducer, {
    status: 'default',
    error: null,
    results: options || [],
  })
  const context = React.useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state],
  )
  React.useEffect(() => {
    if (options && !isEqual(options, state.results)) {
      dispatch({
        type: 'SET_RESULT',
        payload: options,
      })
    }
  }, [state.results, options])
  const onChangeConnected = debounce(
    async e => {
      try {
        if (e.target.value === '') {
          dispatch({
            type: 'RESET',
          })
        } else if (loadOptions) {
          dispatch({
            type: 'FETCH_INIT',
          })
          const results = await loadOptions(e.target.value)
          dispatch({
            type: 'FETCH_SUCCESS',
            payload: results,
          })
        }
      } catch (error) {
        dispatch({
          type: 'FETCH_ERROR',
          payload: error,
        })
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    debounceMs,
    {
      leading: debounceMs === 0,
    },
  )
  return (
    <SearchableDropdownSelectContext.Provider value={context}>
      <S.SearchableDropdownContainer {...rest} disabled={disabled}>
        {message}

        <DropdownSelect.Header>
          <S.Input
            icon={searchInputIcon}
            placeholder={searchPlaceholder}
            type="text"
            disabled={disabled}
            onClear={() => {
              dispatch({
                type: 'RESET',
              })
            }}
            onChange={e => {
              e.persist()
              return options && onChangeSearch ? onChangeSearch(e.target.value) : onChangeConnected(e)
            }}
          />
          {resetChoice?.enabled && (
            <S.ButtonReset type="button" onClick={resetChoice?.onReset} disabled={resetChoice?.disabled}>
              {resetChoice?.message || ''}
            </S.ButtonReset>
          )}
        </DropdownSelect.Header>

        {state.status === 'loading' && (
          <S.MessageContainer>
            <Loader show inline />
          </S.MessageContainer>
        )}

        {state.status === 'no_result' && <S.MessageContainer>{noResultsMessage}</S.MessageContainer>}

        {state.status === 'default' && (
          <React.Fragment>
            {clearChoice?.enabled && (
              <DropdownSelect.Choice key="clear" emitChange={false} onClick={clearChoice?.onClear} value="CLEAR">
                {clearChoice?.message || ''}
              </DropdownSelect.Choice>
            )}
            {defaultOptions && state.results.length === 0 ? children(defaultOptions) : children(state.results)}
          </React.Fragment>
        )}
      </S.SearchableDropdownContainer>
    </SearchableDropdownSelectContext.Provider>
  )
}

export default SearchableDropdownSelect
