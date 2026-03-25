import { graphql } from 'relay-runtime'
import { layoutTestProjectQuery$data } from '@relay/layoutTestProjectQuery.graphql'
import getFeatureFlags from '@utils/feature-flags-resolver'
import getSessionFromSessionCookie from '@utils/session-resolver'
import getViewerJsonFromRedisSession from '@utils/session-decoder'
import { removeAccents } from '@shared/utils/removeAccents'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ssrGraphqlWithLocale } from '../../server/ssr-graphql-with-locale'

const layoutQuery = graphql`
  query layoutTestProjectQuery($projectSlug: String!) {
    project: nodeSlug(entity: PROJECT, slug: $projectSlug) {
      ... on Project {
        id
      }
    }
  }
`

export default async function TestProjectLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ projectSlug: string }>
}>) {
  const featureFlags = await getFeatureFlags()

  if (!featureFlags.new_project_page) return notFound()

  const sessionCookie = cookies().get('PHPSESSID')
  if (!sessionCookie) return notFound()

  const redisSession = await getSessionFromSessionCookie(sessionCookie.value)
  if (!redisSession) return notFound()

  const viewerSession = getViewerJsonFromRedisSession(redisSession)
  if (!viewerSession?.isSuperAdmin) return notFound()

  const { projectSlug } = await params

  const slug = removeAccents(decodeURI(projectSlug))
  const data = await ssrGraphqlWithLocale<layoutTestProjectQuery$data>(layoutQuery, {
    projectSlug: slug,
  })

  if (!data?.project) return notFound()

  return (
    <main role="main" id="project-page">
      {children}
    </main>
  )
}
