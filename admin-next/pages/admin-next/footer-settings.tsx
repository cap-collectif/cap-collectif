import { Suspense } from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import FooterSettingsList from '@components/BackOffice/FooterSettings/FooterSettingsList'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useIntl } from 'react-intl'

const FooterSettings = () => {
  const intl = useIntl()
  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.pages.footer' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <FooterSettingsList />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired
export default FooterSettings
