import * as React from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import { NextPage } from 'next'
import { PageProps } from 'types'
import { useIntl } from 'react-intl'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import FormListQuery from '@components/BackOffice/Forms/FormListQuery'

const Forms: NextPage<PageProps> = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'global.formulaire' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <FormListQuery />
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired
export default Forms
