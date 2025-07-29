import * as React from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import { NextPage } from 'next'
import { PageProps } from 'types'
import { useIntl } from 'react-intl'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import EventListQuery from '@components/BackOffice/Events/EventListQuery'

const Events: NextPage<PageProps> = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'global.events' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <EventListQuery />
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default Events
