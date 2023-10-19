import { useCallback, useState } from 'react'
type State = {
  readonly status: 'idle' | 'toasting' | 'error'
  readonly errorMessage: string | null | undefined
}
type Return = {
  readonly isToasting: boolean
  readonly hasError: boolean
  readonly errorMessage: string | null | undefined
  readonly startToasting: () => void
  readonly stopToasting: () => void
  readonly triggerError: (errorMessage: string) => void
}

const useToastingMachine = (): Return => {
  const [state, setState] = useState<State>({
    status: 'idle',
    errorMessage: null,
  })
  const startToasting = useCallback(() => {
    setState({
      status: 'toasting',
      errorMessage: null,
    })
  }, [])
  const stopToasting = useCallback(() => {
    setState({
      status: 'idle',
      errorMessage: null,
    })
  }, [])

  const triggerError = (errorMessage: string) => {
    setState({
      status: 'error',
      errorMessage,
    })
  }

  const isToasting = state.status === 'toasting'
  const hasError = state.status === 'error'
  return {
    errorMessage: state.errorMessage,
    hasError,
    isToasting,
    startToasting,
    stopToasting,
    triggerError,
  }
}

export default useToastingMachine
