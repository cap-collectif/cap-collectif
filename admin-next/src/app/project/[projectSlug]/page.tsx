import { graphql } from 'relay-runtime'
import { redirect } from 'next/navigation'
import { removeAccents } from '@shared/utils/removeAccents'
import { ssrGraphqlWithLocale } from '../../server/ssr-graphql-with-locale'

type Params = { params: Promise<{ projectSlug: string }> }

type ProjectRedirectData = {
  project?: { url?: string } | null
}

const REDIRECT_QUERY = graphql`
  query pageProjectRedirectQuery($projectSlug: String!) {
    project: nodeSlug(entity: PROJECT, slug: $projectSlug) {
      ... on Project {
        url
      }
    }
  }
`

export default async function Page({ params }: Params) {
  const { projectSlug: ps } = await params
  const projectSlug = removeAccents(decodeURI(ps))

  const data = await ssrGraphqlWithLocale<ProjectRedirectData>(REDIRECT_QUERY, { projectSlug })
  const url = data?.project?.url
  if (url) {
    const parsed = new URL(url)
    redirect(parsed.pathname + parsed.search)
  }
}
