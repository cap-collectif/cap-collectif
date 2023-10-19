import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import ProjectHeaderDistrictsListLegacy from '~/components/Project/ProjectHeaderDistrictsListLegacy'
import ProjectRestrictedAccessFragmentLegacy from '~/components/Project/Page/ProjectRestrictedAccessFragmentLegacy'
import ProjectHeaderBlocksLegacy from '~/components/Project/ProjectHeaderBlocksLegacy'
import ProjectHeaderShareButtonsLegacy from '~/components/Project/ProjectHeaderShareButtonsLegacy'
import type { ProjectHeaderLegacy_project$key } from '~relay/ProjectHeaderLegacy_project.graphql'
import ProjectHeaderLayout from '~ui/Project/ProjectHeaderLegacy'
import ProjectHeaderAuthorListLegacy from '~/components/Project/Authors/ProjectHeaderAuthorListLegacy'
import ProjectHeaderThemeListLegacy from '~/components/Project/ProjectHeaderThemeListLegacy'
import ProjectArchivedTagLegacy from '~/components/Project/ProjectArchivedTagLegacy'
import htmlDecode from '~/components/Utils/htmlDecode'
const FRAGMENT = graphql`
  fragment ProjectHeaderLegacy_project on Project
  @argumentDefinitions(count: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
    id
    title
    url
    hasParticipativeStep
    video
    cover {
      url
      name
    }
    districts {
      totalCount
    }
    themes {
      id
    }
    archived
    visibility
    ...ProjectHeaderThemeListLegacy_project
    ...ProjectHeaderAuthorListLegacy_project
    ...ProjectHeaderBlocksLegacy_project
    ...ProjectHeaderDistrictsListLegacy_project
    ...ProjectRestrictedAccessFragmentLegacy_project @arguments(count: $count, cursor: $cursor)
  }
`
export type Props = {
  readonly project: ProjectHeaderLegacy_project$key
}

const ProjectHeaderLegacy = ({ project }: Props): JSX.Element => {
  const data = useFragment(FRAGMENT, project)

  const renderCover = () => {
    if (data.video) {
      return (
        <ProjectHeaderLayout.CoverVideo
          url={data.video}
          src={data.cover?.url}
          alt={data.cover?.name}
          isArchived={data.archived}
        />
      )
    }

    if (data.cover) {
      return <ProjectHeaderLayout.CoverImage src={data.cover.url} alt={data.cover.name} isArchived={data.archived} />
    }
  }

  return (
    <ProjectHeaderLayout>
      <ProjectHeaderLayout.Cover isArchived={data.archived}>
        <ProjectHeaderLayout.Content>
          <ProjectHeaderAuthorListLegacy project={data} />
          <ProjectHeaderLayout.Title>{htmlDecode(data.title)}</ProjectHeaderLayout.Title>
          {data.hasParticipativeStep && <ProjectHeaderBlocksLegacy project={data} />}
          <ProjectHeaderLayout.Info>
            {data.districts?.totalCount !== 0 && <ProjectHeaderDistrictsListLegacy project={data} breakingNumber={3} />}
            {!!data.themes && data.themes.length > 0 && (
              <ProjectHeaderThemeListLegacy breakingNumber={3} project={data} />
            )}
          </ProjectHeaderLayout.Info>
          <ProjectHeaderShareButtonsLegacy url={data.url} title={data.title} />
        </ProjectHeaderLayout.Content>
        {renderCover()}
        <ProjectRestrictedAccessFragmentLegacy project={data} />
        {data.archived && data.visibility === 'PUBLIC' && <ProjectArchivedTagLegacy />}
      </ProjectHeaderLayout.Cover>
    </ProjectHeaderLayout>
  )
}

export default ProjectHeaderLegacy
