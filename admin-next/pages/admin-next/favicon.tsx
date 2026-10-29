import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import SiteFaviconForm from '@components/BackOffice/SiteFavicon/SiteFaviconForm'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import * as React from 'react'
import { Suspense } from 'react'
import { useIntl } from 'react-intl'

const SiteFavicon: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'website-icon' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <SiteFaviconForm />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default SiteFavicon
