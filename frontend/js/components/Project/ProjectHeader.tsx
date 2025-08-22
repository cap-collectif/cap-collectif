import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import ProjectHeaderDistrictsList from '~/components/Project/ProjectHeaderDistrictsList'
import ProjectRestrictedAccessFragment from '~/components/Project/Page/ProjectRestrictedAccessFragment'
import ProjectHeaderBlocks from '~/components/Project/ProjectHeaderBlocks'
import ProjectHeaderShareButtons from '~/components/Project/ProjectHeaderShareButtons'
import type { ProjectHeader_project$key } from '~relay/ProjectHeader_project.graphql'
import ProjectHeaderLayout from '~ui/Project/ProjectHeader'
import ProjectHeaderAuthorList from '~/components/Project/Authors/ProjectHeaderAuthorList'
import ProjectHeaderThemeList from '~/components/Project/ProjectHeaderThemeList'
import ProjectArchivedTag from '~/components/Project/ProjectArchivedTag'
import htmlDecode from '~/components/Utils/htmlDecode'
import { insertCustomCode } from '~/utils/customCode'
import ProjectStepTabs from '@shared/projectFrise/ProjectStepTabs'
import { useSelector } from 'react-redux'
import { GlobalState } from '~/types'
import { RouterWrapper } from '~ui/Project/ProjectHeader.Frise'

const FRAGMENT = graphql`
  fragment ProjectHeader_project on Project
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
      title
      url
      id
    }
    archived
    visibility
    customCode
    ...ProjectHeaderAuthorList_project
    ...ProjectHeaderBlocks_project
    ...ProjectHeaderDistrictsList_project
    ...ProjectStepTabs_project
    ...ProjectRestrictedAccessFragment_project @arguments(count: $count, cursor: $cursor)
  }
`
export type Props = {
  readonly project: ProjectHeader_project$key
  readonly isConsultation?: boolean
  readonly platformLocale: string
  readonly currentStepId?: string
}

const ProjectHeader = ({ project, isConsultation, platformLocale, currentStepId }: Props): JSX.Element => {
  const data = useFragment(FRAGMENT, project)
  const projectStepId = useSelector((state: GlobalState) => state.project.currentProjectStepById)
  const mainColor = useSelector((state: GlobalState) => state.default.parameters['color.btn.primary.bg'])

  React.useEffect(() => {
    insertCustomCode(data?.customCode, 'projectCustomCode') // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id])

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
          <ProjectHeaderAuthorList project={data} />
          <ProjectHeaderLayout.Title>{htmlDecode(data.title)} </ProjectHeaderLayout.Title>
          {data.hasParticipativeStep && <ProjectHeaderBlocks project={data} />}
          <ProjectHeaderLayout.Info>
            {data.districts?.totalCount !== 0 && <ProjectHeaderDistrictsList project={data} breakingNumber={3} />}
            {!!data.themes && data.themes.length > 0 && (
              <ProjectHeaderThemeList breakingNumber={3} themes={data.themes} isArchived={data.archived} />
            )}
          </ProjectHeaderLayout.Info>
          <ProjectHeaderShareButtons url={data.url} title={data.title} />
        </ProjectHeaderLayout.Content>
        {renderCover()}
        <ProjectRestrictedAccessFragment project={data} />
        {data.archived && data.visibility === 'PUBLIC' && <ProjectArchivedTag />}
      </ProjectHeaderLayout.Cover>
      <ProjectStepTabs
        mainColor={mainColor}
        project={data}
        isConsultation={isConsultation}
        platformLocale={platformLocale}
        currentStepId={currentStepId ?? projectStepId}
        wrapper={RouterWrapper}
        marginBottom={[-8, -13]}
        marginTop={3}
      />
    </ProjectHeaderLayout>
  )
}

export default ProjectHeader
