import * as React from 'react'
import Layout from '@components/BackOffice/Layout/Layout'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import useUrlState from '@hooks/useUrlState'
import MenuItemFormWrapper from '@components/BackOffice/MenuItems/MenuItemFormWrapper'

const MenuItem = (): React.JSX.Element => {
  const [idFromUrl] = useUrlState('id', '')

  return (
    <Layout navTitle={''}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <MenuItemFormWrapper menuItemId={idFromUrl || null} />
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default MenuItem
