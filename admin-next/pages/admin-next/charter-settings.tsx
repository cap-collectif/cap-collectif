import * as React from 'react'
import { Suspense } from 'react'
import { useIntl } from 'react-intl'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import CharterSettingsForm from '@components/BackOffice/CharterSettings/CharterSettingsForm'
import withPageAuthRequired from '@utils/withPageAuthRequired'

const CharterSettings: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.pages.charter' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <CharterSettingsForm />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default CharterSettings
