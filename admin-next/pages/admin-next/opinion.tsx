import { CapUIIconSize, Flex, Spinner, Text } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import { OpinionCreateFormWrapper, OpinionEditFormWrapper } from '@components/BackOffice/Opinions/OpinionFormWrapper'
import { withOpinionAdminPageRequired } from '@components/BackOffice/Opinions/utils'
import useUrlState from '@hooks/useUrlState'
import { useUrlToast } from '@hooks/useUrlToast'
import * as React from 'react'
import { useIntl } from 'react-intl'

const OpinionPage = (): React.JSX.Element => {
  const intl = useIntl()
  const [opinionId] = useUrlState('id', '')
  // The creation page is reached from the list, once the opinion type has been chosen
  const [opinionTypeId] = useUrlState('opinionTypeId', '')
  useUrlToast()

  return (
    <Layout navTitle="">
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        {opinionId ? (
          <OpinionEditFormWrapper opinionId={opinionId} />
        ) : opinionTypeId ? (
          <OpinionCreateFormWrapper opinionTypeId={opinionTypeId} />
        ) : (
          <Text>{intl.formatMessage({ id: 'page.error.not_found' })}</Text>
        )}
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withOpinionAdminPageRequired

export default OpinionPage
