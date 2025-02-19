import * as React from 'react'
import Layout from '@components/Layout/Layout'
import { Flex, Spinner, CapUIIconSize } from '@cap-collectif/ui'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import useUrlState from '@hooks/useUrlState'
import EventFormWrapper, { EventFormWrapperWithData } from '@components/Events/EventFormWrapper'

const Event = () => {
  const [id] = useUrlState('id', '')

  return (
    <Layout navTitle={''}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        {id ? <EventFormWrapperWithData eventId={id} /> : <EventFormWrapper />}
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default Event
