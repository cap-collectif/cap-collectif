// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import type { Props } from '~/components/Organization/Page/OrganizationPage'
import OrganizationPagePlaceholder from '~/components/Organization/Page/OrganizationPagePlaceholder'

const OrganizationPage = lazy(
  () =>
    import(
      /* webpackChunkName: "OrganizationPage" */
      '~/components/Organization/Page/OrganizationPage'
    ),
)
export default (props: Props) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Providers designSystem>
      <Suspense fallback={<OrganizationPagePlaceholder />}>
        <OrganizationPage {...props} />
      </Suspense>
    </Providers>
  )
}
