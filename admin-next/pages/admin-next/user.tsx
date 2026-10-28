import * as React from 'react'
import { useIntl } from 'react-intl'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import UserAdminPage, { UserAdminNotFound } from '@components/BackOffice/UserAdmin/UserAdminPage'
import { withUserAdminPageRequired } from '@components/BackOffice/UserAdmin/utils'
import useUrlState from '@hooks/useUrlState'

const User: React.FC = () => {
  const intl = useIntl()
  const [userId] = useUrlState('id', '')

  return (
    <Layout navTitle={intl.formatMessage({ id: 'global.select_user.type' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        {userId ? <UserAdminPage userId={userId} /> : <UserAdminNotFound />}
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withUserAdminPageRequired

export default User
