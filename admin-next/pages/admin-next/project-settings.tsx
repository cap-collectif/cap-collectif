import * as React from 'react'
import { Suspense } from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import ProjectSettingsList from '@components/BackOffice/ProjectSettings/ProjectSettingsList'
import Layout from '@components/BackOffice/Layout/Layout'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useIntl } from 'react-intl'

const ProjectSettings = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.pages.projects' })}>
      <Suspense fallback={<Flex alignItems="center" justifyContent="center"><Spinner size={CapUIIconSize.Xxl} color="gray.150" /></Flex>}>
        <ProjectSettingsList />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default ProjectSettings
