import * as React from 'react'
import { Suspense } from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import BlogSettingsList from '@components/BackOffice/BlogSettings/BlogSettingsList'
import Layout from '@components/BackOffice/Layout/Layout'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useIntl } from 'react-intl'

const BlogSettings = () => {
  const intl = useIntl()
  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.pages.blog' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <BlogSettingsList />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default BlogSettings
