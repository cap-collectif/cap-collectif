import * as React from 'react'
import Grid from '~ui/Primitives/Layout/Grid'
import ProjectPreview from '~/components/Project/Preview/ProjectPreview'
import type { FeatureToggles } from '~/types'
import type { ProjectPreview_project$ref } from '~relay/ProjectPreview_project.graphql'
import Flex from '~ui/Primitives/Layout/Flex'
type Props = {
  readonly homePageProjectsSectionConfiguration:
    | {
        readonly projects: {
          readonly edges:
            | ReadonlyArray<
                | {
                    readonly node: {
                      readonly $fragmentRefs: ProjectPreview_project$ref
                    }
                  }
                | null
                | undefined
              >
            | null
            | undefined
        }
      }
    | null
    | undefined
  readonly features: FeatureToggles
}

const renderPreview = homePageProjectsSectionConfiguration => {
  if (!homePageProjectsSectionConfiguration) {
    return
  }

  return homePageProjectsSectionConfiguration?.projects?.edges?.map((edge, index) => {
    const project = edge?.node
    return <ProjectPreview key={index} project={project} isProjectsPage={false} />
  })
}

const CustomProjectListView = ({ homePageProjectsSectionConfiguration, features }: Props) => {
  return (
    <>
      {features.new_project_card ? (
        <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}>
          {renderPreview(homePageProjectsSectionConfiguration)}
        </Grid>
      ) : (
        <Flex wrap="wrap">{renderPreview(homePageProjectsSectionConfiguration)}</Flex>
      )}
    </>
  )
}

export default CustomProjectListView
