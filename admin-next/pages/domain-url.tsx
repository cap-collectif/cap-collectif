import { FC } from 'react'
import { useIntl } from 'react-intl'
import Layout from '../components/Layout/Layout'
import { Suspense } from 'react'
import withPageAuthRequired from '../utils/withPageAuthRequired'
import RedirectionIO from '../components/RedirectionIO/RedirectionIO'
import Domain from '../components/Domain/Domain'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'

const DomainUrl: FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'domain.and.url' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <Domain />
        <RedirectionIO />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default DomainUrl
