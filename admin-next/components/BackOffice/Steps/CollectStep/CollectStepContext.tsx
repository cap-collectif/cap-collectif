import useUrlState from '@hooks/useUrlState'
import * as React from 'react'
import { useState } from 'react'

type Props = {
  children: JSX.Element | JSX.Element[] | string
}

export type FormKeyType = 'form' | 'form_model'
export type FormTabs = 'NEW' | 'MODEL'

export const FormTabsEnum: Record<FormTabs, FormTabs> = {
  NEW: 'NEW',
  MODEL: 'MODEL',
} as const

type Context = {
  operationType: string
  setOperationType: (value: string) => void
  proposalFormKey: FormKeyType
  setProposalFormKey: (value: FormKeyType) => void
  selectedTab: FormTabs
  setSelectedTab: (value: FormTabs) => void
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
  const [operationType, setOperationType] = useUrlState('operationType', 'EDIT')
  const [proposalFormKey, setProposalFormKey] = useState<FormKeyType>('form')
  const [selectedTab, setSelectedTab] = useState<FormTabs>(FormTabsEnum.NEW)

  const contextValue: Context = {
    operationType,
    setOperationType,
    proposalFormKey,
    setProposalFormKey,
    selectedTab,
    setSelectedTab,
  }

  return <CollectStepContext.Provider value={contextValue}>{children}</CollectStepContext.Provider>
}
