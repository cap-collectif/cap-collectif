import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import CustomCodeVersioningPage from '@components/BackOffice/CustomCode/CustomCodeVersioningPage'
import Layout from '@components/BackOffice/Layout/Layout'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { Suspense } from 'react'
import { useIntl } from 'react-intl'

const CustomCode = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.customcode' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <CustomCodeVersioningPage />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default CustomCode
