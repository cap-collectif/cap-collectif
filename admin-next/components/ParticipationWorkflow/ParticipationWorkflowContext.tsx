import * as React from 'react'

type Props = {
  children: JSX.Element | JSX.Element[] | string
  value: {
    contributionUrl: string
    logo: {
      url: string
      width: number
      height: number
    }
    requirementsUrl: string
    stepId: string
    contributionId: string
    contributionTypeName: string
    captchaError: string | null
    setCaptchaError: (captchaError: string | null) => void
    captchaStepIndex: number | null
    setCaptchaStepIndex: (captchaStepIndex: number | null) => void
  }
}

type Context = {
  contributionUrl: string
  logo: {
    url: string
    width: number
    height: number
  }
  requirementsUrl: string
  stepId: string
  contributionId: string
  contributionTypeName: string
  captchaError: string | null
  setCaptchaError: (captchaError: string | null) => void
  captchaStepIndex: number | null
  setCaptchaStepIndex: (captchaStepIndex: number | null) => void
} | null

export const ParticipationWorkflowContext = React.createContext<Context>(null)

export const useParticipationWorkflow = () => {
  const context = React.useContext(ParticipationWorkflowContext)

  if (!context) {
    throw new Error(`You can't use the useParticipationWorkflow outside a ParticipationWorkflowContext component.`)
  }

  return context
}

export const ParticipationWorkflowContextProvider = ({ children, value }: Props) => {
  return <ParticipationWorkflowContext.Provider value={value}>{children}</ParticipationWorkflowContext.Provider>
}
