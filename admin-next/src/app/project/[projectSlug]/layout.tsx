import { graphql } from 'relay-runtime'
import { layoutProjectQuery$data } from '@relay/layoutProjectQuery.graphql'
import { removeAccents } from '@shared/utils/removeAccents'
import { notFound } from 'next/navigation'
import { ssrGraphqlWithLocale } from '../../server/ssr-graphql-with-locale'

export const layoutQuery = graphql`
  query layoutProjectQuery($projectSlug: String!) {
    project: nodeSlug(entity: PROJECT, slug: $projectSlug) {
      ... on Project {
        id
      }
    }
  }
`

export default async function ProjectLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ projectSlug: string }>
}>) {
  const { projectSlug } = await params

  const slug = removeAccents(decodeURI(projectSlug))
  const data = await ssrGraphqlWithLocale<layoutProjectQuery$data>(layoutQuery, {
    projectSlug: slug,
  })

  if (!data?.project) return notFound()

  return (
    <main role="main" id="project-page">
      {children}
    </main>
  )
}
