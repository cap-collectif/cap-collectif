/* eslint-disable relay/must-colocate-fragment-spreads */
/* eslint-disable relay/unused-fields */
import { graphql } from 'relay-runtime'
import Fetcher from '@utils/fetch'
import { layoutProjectQuery$data } from '@relay/layoutProjectQuery.graphql'
import { removeAccents } from '@shared/utils/removeAccents'
import ProjectHeader from '@components/FrontOffice/ProjectHeader/ProjectHeader'
import { notFound } from 'next/navigation'

export const layoutQuery = graphql`
  query layoutProjectQuery($projectSlug: String!) {
    project: nodeSlug(entity: PROJECT, slug: $projectSlug) {
      ... on Project {
        id
        hasParticipativeStep
        title
        visibility
        archived
        cover {
          url
        }
        video
        authors {
          __typename
          ... on User {
            media {
              url
            }
          }
          id
          url
          username
        }
        districts {
          totalCount
          edges {
            node {
              id
              name
            }
          }
        }
        themes {
          title
          id
        }
      }
    }
    siteImage(keyname: "image.default_avatar") {
      id
      media {
        url
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
  const data = await Fetcher.ssrGraphql<layoutProjectQuery$data>(layoutQuery, {
    projectSlug: slug,
  })

  if (!data?.project) return notFound()
  const { project, siteImage } = data

  return (
    <main role="main" id="project-page">
      <ProjectHeader project={project} defaultAvatarImage={siteImage?.media?.url} projectSlug={slug} />
      {children}
    </main>
  )
}
