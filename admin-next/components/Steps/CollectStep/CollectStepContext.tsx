import useUrlState from "../../../../frontend/js/utils/hooks/useUrlState";
import * as React from "react";

type Props = {
  children: JSX.Element | JSX.Element[] | string
}

type Context = {
  operationType: string,
  setOperationType: (value: string) => void
} | null

export const CollectStepContext = React.createContext<Context>(null)

export const useCollectStep = () => {
  const context = React.useContext(CollectStepContext)

  if (!context) {
    throw new Error(`You can't use the useCollectStep outside a CollectStepContext component.`)
  }

  return context
}

export const CollectStepContextProvider = ({ children }: Props) => {

  const [operationType, setOperationType] = useUrlState('operationType', 'EDIT');

  const contextValue: Context = {
    operationType,
    setOperationType
  }

  return <CollectStepContext.Provider value={contextValue}>{children}</CollectStepContext.Provider>
}