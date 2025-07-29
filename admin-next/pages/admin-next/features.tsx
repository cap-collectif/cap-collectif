import Layout from '@components/BackOffice/Layout/Layout'
import { useIntl } from 'react-intl'
import FeatureList from '@components/BackOffice/FeatureList/FeatureList'
import withPageAuthRequired from '@utils/withPageAuthRequired'

const Features = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.features' })}>
      <FeatureList />
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default Features
