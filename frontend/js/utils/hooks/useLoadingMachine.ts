import { useCallback, useState } from 'react'
type State = {
  readonly status: 'idle' | 'loading' | 'error'
  readonly errorMessage: string | null | undefined
}
type Return = {
  readonly isLoading: boolean
  readonly hasError: boolean
  readonly errorMessage: string | null | undefined
  readonly startLoading: () => void
  readonly stopLoading: () => void
  readonly triggerError: (errorMessage: string) => void
}

const useLoadingMachine = (): Return => {
  const [state, setState] = useState<State>({
    status: 'idle',
    errorMessage: null,
  })
  const startLoading = useCallback(() => {
    setState({
      status: 'loading',
      errorMessage: null,
    })
  }, [])
  const stopLoading = useCallback(() => {
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

  const isLoading = state.status === 'loading'
  const hasError = state.status === 'error'
  return {
    errorMessage: state.errorMessage,
    hasError,
    isLoading,
    startLoading,
    stopLoading,
    triggerError,
  }
}

export default useLoadingMachine
