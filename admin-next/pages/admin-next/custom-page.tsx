import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import CustomPageFormWrapper, {
  CustomPageFormWrapperWithData,
} from '@components/BackOffice/CustomPages/CustomPageFormWrapper'
import Layout from '@components/BackOffice/Layout/Layout'
import useUrlState from '@hooks/useUrlState'
import { useUrlToast } from '@hooks/useUrlToast'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import * as React from 'react'

const CustomPage = (): React.JSX.Element => {
  const [idFromUrl] = useUrlState('id', '')
  useUrlToast()

  return (
    <Layout navTitle={''}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        {idFromUrl ? <CustomPageFormWrapperWithData pageId={idFromUrl} /> : <CustomPageFormWrapper />}
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default CustomPage
