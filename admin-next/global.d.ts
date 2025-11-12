export {}

declare global {
  interface Window {
    locale: string
    intl_messages: string
    __REDUX_DEVTOOLS_EXTENSION__: Function
    MAPBOX_PUBLIC_TOKEN: string | null
    MAPBOX_PUBLIC_STYLE_OWNER: string | null
    MAPBOX_PUBLIC_STYLE_ID: string | null
  }
  type ReactRelayReadyState = {
    error: Error | null | undefined
    props: Object | null | undefined
    retry: (() => void) | null | undefined
  }

  type ReduxFormFormProps = {
    anyTouched: boolean
    array: {
      insert: (field: string, index: number, value: any) => void
      move: (field: string, from: number, to: number) => void
      pop: (field: string) => void
      push: (field: string, value: any) => void
      remove: (field: string, index: number) => void
      removeAll: (field: string) => void
      shift: (field: string) => void
      splice: (field: string, index: number, removeNum: number, value: any) => void
      swap: (field: string, indexA: number, indexB: number) => void
      unshift: (field: string, value: any) => void
    }
    asyncValidate: () => void
    asyncValidating: boolean
    autofill: (field: string, value: any) => void
    blur: (field: string, value: any) => void
    change: (field: string, value: any) => void
    clearAsyncError: (field: string) => void
    clearSubmit: () => void
    destroy: () => void
    dirty: boolean
    dispatch: Function
    error: string | null | undefined
    form: string
    handleSubmit: (eventOrSubmit: any) => void | Promise<any>
    initialize: (data: Object) => void
    initialized: boolean
    invalid: boolean
    pristine: boolean
    reset: () => void
    submitting: boolean
    submitFailed: boolean
    submitSucceeded: boolean
    touch: (...fields: string[]) => void
    untouch: (...fields: string[]) => void
    updateSyncErrors: () => void
    valid: boolean
    warning: any
    // for now
  } & any

  type ReduxFormFieldArrayProps = {
    fields: ReduxFormFields
    meta: {
      dirty: boolean
      error?: any
      form: string
      invalid: boolean
      pristine: boolean
      submitting: boolean
      submitFailed: boolean
      touched: boolean
      valid: boolean
      warning?: any
    }
    ref?: any
  }
}
