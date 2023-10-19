// @ts-nocheck
import * as React from 'react'
export type Step = {
  readonly id: string
  readonly validationLabel: string
  readonly label?: string
  readonly infoUrl?: string
}
export type Context = {
  readonly currentStep: number
  readonly setCurrentStep: (stepIndex: number) => void
  readonly steps: Step[]
  readonly registerSteps: (steps: Step[]) => void
}
export const ModalStepsContext = React.createContext<Context>({
  currentStep: 0,
  setCurrentStep: () => {},
  steps: [],
  registerSteps: () => {},
})
export const useModalSteps = (): Context => {
  const context = React.useContext(ModalStepsContext)

  if (!context) {
    throw new Error(`You can't use the ModalStepsContext outsides a ModalSteps component.`)
  }

  return context
}
