import ProjectPage from '@components/FrontOffice/Project/ProjectPage'
import { removeAccents } from '@shared/utils/removeAccents'

type Params = { params: Promise<{ projectSlug: string }> }

export default async function Page({ params }: Params) {
  const { projectSlug: ps } = await params
  const projectSlug = removeAccents(decodeURI(ps))

  return <ProjectPage projectSlug={projectSlug} />
}
