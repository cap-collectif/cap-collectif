import { Suspense } from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'

import withPageAuthRequired from '@utils/withPageAuthRequired'
import Layout from '@components/Layout/Layout'

import { HomePageCarrouselSectionConfigurationPage } from '../carrousel/[sectionId]'

const PageWithLayout = () => {
  return (
    <Layout navTitle="">
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <HomePageCarrouselSectionConfigurationPage type="carrouselHighlighted" />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default PageWithLayout
