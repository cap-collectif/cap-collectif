import * as React from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import type { StyledComponent } from 'styled-components'
import 'styled-components'
import * as S from './styles'
import Header from './header'
import Body from './body'
import Row from './row'
import type { Action, State } from '~ui/List/PickableList/reducer'
import { createReducer } from '~ui/List/PickableList/reducer'
import { PickableListContext } from '~ui/List/PickableList/context'
type Props = {
  isLoading?: boolean
  onScrollToBottom?: () => void
  useInfiniteScroll?: boolean
  hasMore?: boolean
  loader?: JSX.Element | JSX.Element[] | string
  children: React.ChildrenArray<
    | React.ReactElement<typeof Header>
    | React.ReactElement<typeof Body>
    | React.ReactElement<StyledComponent<any, {}, typeof Body>>
    | React.ReactElement<StyledComponent<any, {}, typeof Header>>
  >
}
type ProviderProps = {
  readonly children: JSX.Element | JSX.Element[] | string
}

const Provider = ({ children }: ProviderProps) => {
  const [state, dispatch] = React.useReducer<State, Action>(createReducer, {
    rows: {},
  })
  const context = React.useMemo(
    () => ({
      get hasAnyRowsChecked() {
        return Object.keys(state.rows).some(rowId => state.rows[rowId] === true)
      },

      get hasAllRowsChecked() {
        const keys = Object.keys(state.rows)
        return keys.length > 0 && keys.every(rowId => state.rows[rowId] === true)
      },

      get selectedRows() {
        return Object.keys(state.rows).filter(rowId => state.rows[rowId] === true)
      },

      get hasIndeterminateState() {
        return this.hasAnyRowsChecked && this.selectedRows.length < Object.keys(this.rows).length
      },

      get rowsCount() {
        return Object.keys(this.rows).length
      },

      isRowChecked: rowId => rowId in state.rows && state.rows[rowId] === true,
      rows: state.rows,
      dispatch,
    }),
    [state.rows],
  )
  return <PickableListContext.Provider value={context}>{children}</PickableListContext.Provider>
}

const noop = () => {}

const PickableList = ({
  children,
  loader,
  useInfiniteScroll = false,
  onScrollToBottom = noop,
  hasMore = true,
  isLoading = false,
  ...rest
}: Props) => {
  return (
    <S.Container {...rest} isLoading={isLoading}>
      {isLoading && (
        <S.GlobalLoaderContainer>
          <S.GlobalLoader />
        </S.GlobalLoaderContainer>
      )}
      {useInfiniteScroll ? (
        <InfiniteScroll initialLoad={false} pageStart={0} loadMore={onScrollToBottom} hasMore={hasMore} loader={loader}>
          {children}
        </InfiniteScroll>
      ) : (
        children
      )}
    </S.Container>
  )
}

PickableList.Provider = Provider
PickableList.Header = Header
PickableList.Body = Body
PickableList.Row = Row
export default PickableList
