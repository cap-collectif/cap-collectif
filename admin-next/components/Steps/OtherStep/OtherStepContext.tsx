import useUrlState from '../../../../frontend/js/utils/hooks/useUrlState'
import * as React from 'react'

type Props = {
  children: JSX.Element | JSX.Element[] | string
}

type Context = {
  operationType: string
  setOperationType: (value: string) => void
} | null

export const OtherStepContext = React.createContext<Context>(null)

export const useOtherStep = () => {
  const context = React.useContext(OtherStepContext)

  if (!context) {
    throw new Error(`You can't use the useOtherStep outside a OtherStepContext component.`)
  }

  return context
}

export const OtherStepContextProvider = ({ children }: Props) => {
  const [operationType, setOperationType] = useUrlState('operationType', 'EDIT')

  const contextValue: Context = {
    operationType,
    setOperationType,
  }

  return <OtherStepContext.Provider value={contextValue}>{children}</OtherStepContext.Provider>
}
