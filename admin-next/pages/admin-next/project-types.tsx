import { FC, Suspense } from 'react'
import { useIntl } from 'react-intl'
import Layout from '@components/BackOffice/Layout/Layout'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import ProjectTypesList from '@components/BackOffice/ProjectTypes/ProjectTypesList'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'

const ProjectTypes: FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.pages.types' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <ProjectTypesList />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default ProjectTypes
