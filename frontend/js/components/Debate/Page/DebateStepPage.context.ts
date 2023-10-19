import * as React from 'react'
export type Context = {
  readonly stepClosed: boolean
  readonly widget: {
    readonly isSource: boolean
    readonly location: string | null | undefined
  }
}
export const DebateStepPageContext: React.Context<Context> = React.createContext<Context>({
  stepClosed: true,
  widget: {
    isSource: false,
    location: null,
  },
})
export const useDebateStepPage = (): Context => {
  const context = React.useContext(DebateStepPageContext)

  if (!context) {
    throw new Error(`You can't use the DebateStepPageContext outsides a DebateStepPage.Provider component.`)
  }

  return context
}
