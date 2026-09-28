import * as React from 'react'
import { Suspense } from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import EventSettingsList from '@components/BackOffice/EventSettings/EventSettingsList'
import Layout from '@components/BackOffice/Layout/Layout'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useIntl } from 'react-intl'

const EventSettings = () => {
  const intl = useIntl()
  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.pages.events' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <EventSettingsList />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default EventSettings
