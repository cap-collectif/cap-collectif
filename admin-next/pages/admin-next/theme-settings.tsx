import * as React from 'react'
import { Suspense } from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import ThemeSettingsList from '@components/BackOffice/ThemeSettings/ThemeSettingsList'
import Layout from '@components/BackOffice/Layout/Layout'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useIntl } from 'react-intl'

const ThemeSettings = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.pages.themes' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <ThemeSettingsList />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default ThemeSettings
