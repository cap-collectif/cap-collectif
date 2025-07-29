import { NextPage } from 'next'
import { PageProps } from 'types'
import Layout from '@components/BackOffice/Layout/Layout'
import { Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import withPageAuthRequired from '@utils/withPageAuthRequired'

const Index: NextPage<PageProps> = ({ viewerSession }) => {
  const intl = useIntl()

  return (
    <Layout
      navTitle="Home"
      navData={[
        {
          number: {
            color: 'blue.500',
            label: '12',
          },
          label: 'projects',
        },
        {
          number: {
            color: 'red.500',
            label: '15',
          },
          label: 'proposals',
        },
      ]}
    >
      <Text>
        {intl.formatMessage({ id: 'global-hello' })}: {JSON.stringify(viewerSession)}
      </Text>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default Index
