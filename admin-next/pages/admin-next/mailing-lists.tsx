import * as React from 'react'
import { useIntl } from 'react-intl'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import MailingListsPage from '@components/BackOffice/Emailing/MailingLists/MailingListsPage'
import { SONATA_MAILING_LISTS_URL, withEmailingPageRequired } from '@components/BackOffice/Emailing/utils'

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

export const getServerSideProps = withEmailingPageRequired(SONATA_MAILING_LISTS_URL)

export default MailingLists
