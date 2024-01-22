import useUrlState from "../../../../frontend/js/utils/hooks/useUrlState";
import * as React from "react";

type Props = {
  children: JSX.Element | JSX.Element[] | string
}

type Context = {
  operationType: string,
  setOperationType: (value: string) => void
} | null

export const ConsultationStepContext = React.createContext<Context>(null)

export const useConsultationStep = () => {
  const context = React.useContext(ConsultationStepContext)

  if (!context) {
    throw new Error(`You can't use the useConsultationStep outside a ConsultationStepContext component.`)
  }

  return context
}

export const ConsultationStepContextProvider = ({ children }: Props) => {

  const [operationType, setOperationType] = useUrlState('operationType', 'EDIT');

  const contextValue: Context = {
    operationType,
    setOperationType
  }

  return <ConsultationStepContext.Provider value={contextValue}>{children}</ConsultationStepContext.Provider>
}