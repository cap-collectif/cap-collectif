import * as React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'styled-components'
import { Provider } from 'react-redux'
import { Provider as ReakitProvider } from 'reakit'
import { IntlProvider } from 'react-intl-redux'
import { RelayEnvironmentProvider } from 'react-relay'
import { CapUIProvider } from '@cap-collectif/ui'
import { BrowserRouter as Router } from 'react-router-dom'
import { theme } from '~/styles/theme'
import appStore from '~/stores/AppStore'
import type { FeatureFlagType } from '~relay/useFeatureFlagQuery.graphql'
import { FormProvider, useForm } from 'react-hook-form'

export const mockRandomValues = () => {
  global.Math.random = () => 0.5
}
export const enableFeatureFlags = (flags: Array<FeatureFlagType>) => {
  global.mockFeatureFlag.mockImplementation((flag: Array<FeatureFlagType>) => {
    if (flags.includes(flag)) {
      return true
    }

    return false
  })
}
export const disableFeatureFlags = () => {
  global.mockFeatureFlag.mockImplementation(() => false)
}
export const mockUrl = (url: string) => {
  // https://stackoverflow.com/questions/54021037/how-to-mock-window-location-href-with-jest-vuejs
  delete window.location
  // @ts-expect-error assign new URL(...) to window.location because property location is not writable
  window.location = new URL(url)
}
export const addsSupportForPortals = () => {
  // See: https://github.com/facebook/react/issues/11565
  // @ts-expect-error
  ReactDOM.createPortal = jest.fn(element => {
    return element
  })
}
export const clearSupportForPortals = () => {
  // @ts-expect-error
  ReactDOM.createPortal.mockClear()
}
type Props = {
  children: JSX.Element | JSX.Element[] | string
  store?: any
  useCapUIProvider?: boolean
}
export const MockProviders = ({ children, store = {}, useCapUIProvider = false }: Props) => {
  return (
    <Provider store={appStore(store)}>
      <Router>
        <IntlProvider>
          <ReakitProvider>
            {useCapUIProvider ? (
              <CapUIProvider>{children}</CapUIProvider>
            ) : (
              <ThemeProvider theme={theme}>{children}</ThemeProvider>
            )}
          </ReakitProvider>
        </IntlProvider>
      </Router>
    </Provider>
  )
}
type RelaySuspensFragmentTestProps = Props & {
  environment: any
}
export const RelaySuspensFragmentTest = ({
  children,
  environment,
  store = {},
  useCapUIProvider = false,
}: RelaySuspensFragmentTestProps) => {
  return (
    <MockProviders store={store} useCapUIProvider={useCapUIProvider}>
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="">{children}</React.Suspense>
      </RelayEnvironmentProvider>
    </MockProviders>
  )
}

export const FormWrapper = props => {
  const formMethods = useForm()

  return <FormProvider {...formMethods}>{props.children}</FormProvider>
}

export default MockProviders
