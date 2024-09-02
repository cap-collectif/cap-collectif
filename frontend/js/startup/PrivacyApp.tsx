// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'
import { PrivacyPolicyComponent } from '@shared/register/RegistrationForm'

const PrivacyModal = lazy(
  () =>
    import(
      /* webpackChunkName: "PrivacyModal" */
      '@shared/register/PrivacyModal'
    ),
)
export default () => (
  <Suspense fallback={<Loader />}>
    <Providers designSystem>
      <PrivacyPolicyComponent privacyPolicyRequired privacyOnly />
      <PrivacyModal />
    </Providers>
  </Suspense>
)
