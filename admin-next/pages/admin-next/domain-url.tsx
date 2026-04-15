import { FC } from 'react'
import { useIntl } from 'react-intl'
import Layout from '@components/BackOffice/Layout/Layout'
import { Suspense } from 'react'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import CustomRedirection from '@components/BackOffice/Redirection/CustomRedirection'
import RedirectionIOLegacy from '@components/BackOffice/Redirection/RedirectionIOLegacy'
import Domain from '@components/BackOffice/Domain/Domain'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

const DomainUrl: FC = () => {
  const intl = useIntl()
  const hasHttpRedirects = useFeatureFlag('http_redirects')

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
        {hasHttpRedirects ? <RedirectionIOLegacy /> : <CustomRedirection />}
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default DomainUrl
