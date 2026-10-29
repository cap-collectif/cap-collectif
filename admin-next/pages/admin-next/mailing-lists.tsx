import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import MailingListsPage from '@components/BackOffice/Emailing/MailingLists/MailingListsPage'
import { withEmailingPageRequired } from '@components/BackOffice/Emailing/utils'
import Layout from '@components/BackOffice/Layout/Layout'
import * as React from 'react'
import { useIntl } from 'react-intl'

const MailingLists: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout
      navTitle={`${intl.formatMessage({ id: 'admin-menu-emailing-list' })} (${intl.formatMessage({
        id: 'global.beta',
      })})`}
    >
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <MailingListsPage />
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withEmailingPageRequired

export default MailingLists
