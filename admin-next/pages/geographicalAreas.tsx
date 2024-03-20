import { Suspense } from 'react'
import { useIntl } from 'react-intl'
import Layout from '../components/Layout/Layout'
import withPageAuthRequired from '../utils/withPageAuthRequired'
import GeographicalAreasList from 'components/GeographicalAreasList/GeographicalAreasList'
import { Flex, Spinner, CapUIIconSize } from '@cap-collectif/ui'

const GeographicalAreas = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'proposal_form.districts' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <GeographicalAreasList />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default GeographicalAreas
