import Layout from '@components/BackOffice/Layout/Layout'
import MemberSettingsList from '@components/BackOffice/MemberSettings/MemberSettingsList'
import { Spinner } from '@cap-collectif/ui'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { Suspense } from 'react'
import { useIntl } from 'react-intl'

const MemberSettings = () => {
  const intl = useIntl()

  return <Layout navTitle={intl.formatMessage({ id: 'admin.label.pages.members' })}>
    <Suspense fallback={<Spinner m="auto" />}><MemberSettingsList /></Suspense>
  </Layout>
}

export const getServerSideProps = withPageAuthRequired

export default MemberSettings
