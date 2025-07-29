import useUrlState from '@hooks/useUrlState'
import * as React from 'react'

type Props = {
  children: JSX.Element | JSX.Element[] | string
}

type Context = {
  operationType: string
  setOperationType: (value: string) => void
} | null

export const SelectionStepContext = React.createContext<Context>(null)

export const useSelectionStep = () => {
  const context = React.useContext(SelectionStepContext)

  if (!context) {
    throw new Error(`You can't use the useSelectionStep outside a SelectionStepContext component.`)
  }

  return context
}

export const SelectionStepContextProvider = ({ children }: Props) => {
  const [operationType, setOperationType] = useUrlState('operationType', 'EDIT')

  const contextValue: Context = {
    operationType,
    setOperationType,
  }

  return <SelectionStepContext.Provider value={contextValue}>{children}</SelectionStepContext.Provider>
}
