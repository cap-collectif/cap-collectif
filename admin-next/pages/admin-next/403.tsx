import { CapUISpotIcon, CapUISpotIconSize, Flex, Heading, SpotIcon, Text } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import { resolveViewerPageProps } from '@utils/withPageAuthRequired'
import { GetServerSideProps } from 'next'
import { useIntl } from 'react-intl'

// This page is reached via `withPageAuthRequired`'s `redirectToForbidden`, which only fires once the
// viewer already has a valid session with at least one BO-access role (see `withPageAuthRequired.ts`) —
// so `Layout` below always has the `viewerSession`/`intl` context it needs. It's still a public URL
// though (nothing stops someone from navigating here directly without a session), so if that ever
// happens we send them to the homepage instead of rendering `Layout` on a missing `viewerSession`.
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const pageProps = await resolveViewerPageProps(req)

  if (!pageProps) {
    res.writeHead(302, { Location: '/' })
    res.end()
    return { props: {} }
  }

  res.statusCode = 403
  return { props: pageProps }
}

export default function Custom403() {
  const intl = useIntl()

  return (
    <Layout navTitle={'403 - Forbidden'}>
      <Flex direction="column" alignItems="center" justifyContent="center" height="100%" gap="xl">
        <Heading as="h2">{intl.formatMessage({ id: 'unauthorized-access' })}</Heading>
        <SpotIcon name={CapUISpotIcon.ERROR} size={CapUISpotIconSize.Lg} color="gray.150" ml={4} />
        <Text>{intl.formatMessage({ id: 'global.page-with-restricted-access' })}</Text>
      </Flex>
    </Layout>
  )
}
