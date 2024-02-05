import useUrlState from "../../../../frontend/js/utils/hooks/useUrlState";
import * as React from "react";

type Props = {
  children: JSX.Element | JSX.Element[] | string
}

type Context = {
  operationType: string,
  setOperationType: (value: string) => void
} | null

export const DebateStepContext = React.createContext<Context>(null)

export const useDebateStep = () => {
  const context = React.useContext(DebateStepContext)

  if (!context) {
    throw new Error(`You can't use the useDebateStep outside a DebateStepContext component.`)
  }

  return context
}

export const DebateStepContextProvider = ({ children }: Props) => {

  const [operationType, setOperationType] = useUrlState('operationType', 'EDIT');

  const contextValue: Context = {
    operationType,
    setOperationType
  }

  return <DebateStepContext.Provider value={contextValue}>{children}</DebateStepContext.Provider>
}