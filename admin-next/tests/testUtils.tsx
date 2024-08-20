import * as React from 'react'
import ReactDOM from 'react-dom'
import Providers from '../utils/providers'
import { RelayEnvironmentProvider } from 'react-relay'
import type { FeatureFlags } from '../types'
import { intlMock, features as mockFeatures } from './mocks'
import GlobalCSS from 'styles/GlobalCSS'
import { FeatureFlagType } from '@relay/useFeatureFlagQuery.graphql'
import { ReactPortal } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

export const mockRandomValues = () => {
  global.Math.random = () => 0.5
}

export const enableFeatureFlags = (flags: [FeatureFlagType]) => {
  global.mockFeatureFlag.mockImplementation((flag: FeatureFlagType) => {
    return flags.includes(flag as FeatureFlagType)
  })
}

export const disableFeatureFlags = () => {
  global.mockFeatureFlag.mockImplementation(() => false)
}

export const mockUrl = (url: string) => {
  delete window.location
  // @ts-ignore fixme
  window.location = new URL(url)
}

export const addsSupportForPortals = () => {
  ReactDOM.createPortal = jest.fn(element => {
    return element as ReactPortal
  })
}

export const clearSupportForPortals = () => {
  // @ts-ignore fixme
  ReactDOM.createPortal.mockClear()
}

type Props = {
  children: React.ReactNode
  viewerSession?: null | undefined | any
  features?: FeatureFlags
}

export const MockProviders = ({ children, viewerSession, features }: Props) => {
  return (
    <Providers
      featureFlags={{ ...mockFeatures, ...features }}
      intl={intlMock}
      viewerSession={viewerSession}
      appVersion="test"
    >
      <GlobalCSS />
      {children}
    </Providers>
  )
}

type RelaySuspensFragmentTestProps = { environment: any } & Props

export const RelaySuspensFragmentTest = ({ children, environment, features }: RelaySuspensFragmentTestProps) => {
  return (
    <MockProviders features={features}>
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
