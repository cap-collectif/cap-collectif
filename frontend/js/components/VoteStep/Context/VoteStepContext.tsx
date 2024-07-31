import * as React from 'react'
import useUrlState from '~/utils/hooks/useUrlState'
import { View } from '../utils'
import { useWindowWidth } from '~/utils/hooks/useWindowWidth'

type Context = {
  filters: {
    term: string | null
    sort: string | null
    userType: string | null
    theme: string | null
    category: string | null
    district: string | null
    status: string | null
    latlng: string | null
    latlngBounds: string | null
    address: string | null
  }
  setFilters: (key: string, value: string) => void
  view: string
  setView: (value: string) => void
  hasMapView: boolean
  isParticipationAnonymous: boolean
  setIsParticipationAnonymous: (value: boolean) => void
}

// @ts-ignore Context is initialized after
export const VoteStepContext = React.createContext<Context>({})

export const useVoteStepContext = () => {
  const context = React.useContext(VoteStepContext)

  if (!context) {
    throw new Error(`You can't use the useVoteStepContext outside a VoteStepContext component.`)
  }

  return context
}

type Props = {
  children: JSX.Element | JSX.Element[] | string
  isMapView?: boolean
  hasMapView: boolean
  isParticipationAnonymous
}

export const VoteStepContextProvider = ({
  children,
  isMapView,
  hasMapView,
  isParticipationAnonymous: initialIsParticipationAnonymous,
}: Props) => {
  const [term, setTerm] = useUrlState('term', '')
  const [sort, setSort] = useUrlState('sort', '')
  const [userType, setUserType] = useUrlState('userType', '')
  const [theme, setTheme] = useUrlState('theme', '')
  const [category, setCategory] = useUrlState('category', '')
  const [district, setDistrict] = useUrlState('district', '')
  const [status, setStatus] = useUrlState('status', '')
  const [latlng, setLatlng] = useUrlState('latlng', '')
  const [latlngBounds, setLatlngBounds] = useUrlState('latlngBounds', '')
  const [address, setAddress] = useUrlState('address', '')
  const [isParticipationAnonymous, setIsParticipationAnonymous] = React.useState(initialIsParticipationAnonymous)
  const { width } = useWindowWidth()
  const enableMapView = hasMapView && width > 1132
  const [view, setView] = useUrlState('view', isMapView && enableMapView ? View.Map : View.List)

  const contextValue: Context = {
    filters: {
      term,
      sort,
      userType,
      theme,
      category,
      district,
      status,
      latlng,
      latlngBounds,
      address,
    },
    setFilters: (key, value) => {
      if (key === 'term') {
        setTerm(value)
      }

      if (key === 'sort') {
        setSort(value)
      }

      if (key === 'userType') {
        setUserType(value)
      }

      if (key === 'theme') {
        setTheme(value)
      }

      if (key === 'category') {
        setCategory(value)
      }

      if (key === 'district') {
        setDistrict(value)
      }

      if (key === 'status') {
        setStatus(value)
      }

      if (key === 'latlng') {
        setLatlng(value)
      }

      if (key === 'latlngBounds') {
        setLatlngBounds(value)
      }

      if (key === 'address') {
        setAddress(value)
      }
    },
    view,
    setView,
    hasMapView: enableMapView,
    isParticipationAnonymous,
    setIsParticipationAnonymous,
  }
  return <VoteStepContext.Provider value={contextValue}>{children}</VoteStepContext.Provider>
}
