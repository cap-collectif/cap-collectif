import * as React from 'react'
import { Accordion, CapUIAccordionColor, CapUIAccordionSize } from '@cap-collectif/ui'
import { ProjectConfigFormSide_query$key } from '@relay/ProjectConfigFormSide_query.graphql'
import { ProjectConfigFormSide_project$key } from '@relay/ProjectConfigFormSide_project.graphql'
import { graphql, useFragment } from 'react-relay'
import ProjectConfigFormParameters from './ProjectConfigFormParameters'
import ProjectConfigFormAccess from './ProjectConfigFormAccess'
import ProjectConfigFormPublication from './ProjectConfigFormPublication'
import ProjectConfigFormExternal from './ProjectConfigFormExternal'
import ProjectConfigFormSteps from '../ProjectConfigFormSteps'
import { useIntl } from 'react-intl'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

export interface ProjectConfigFormSideProps {
  query: ProjectConfigFormSide_query$key
  project: ProjectConfigFormSide_project$key
}

const QUERY_FRAGMENT = graphql`
  fragment ProjectConfigFormSide_query on Query {
    viewer {
      isAdmin
    }
    availableLocales(includeDisabled: false) {
      value: id
      label: traductionKey
    }
  }
`

const PROJECT_FRAGMENT = graphql`
  fragment ProjectConfigFormSide_project on Project {
    ...ProjectConfigFormPublication_project
    ...ProjectConfigFormParameters_project
  }
`

const ProjectConfigFormSide: React.FC<ProjectConfigFormSideProps> = ({ query: queryRef, project: projectRef }) => {
  const intl = useIntl()
  const query = useFragment(QUERY_FRAGMENT, queryRef)
  const project = useFragment(PROJECT_FRAGMENT, projectRef)
  const isNewProjectPage = useFeatureFlag('new_project_page')

  const locales = query.availableLocales.map(u => ({
    value: u.value,
    label: intl.formatMessage({ id: u.label }),
  }))

  return (
    <>
      <Accordion
        allowMultiple
        defaultAccordion={['steps']}
        size={CapUIAccordionSize.md}
        color={CapUIAccordionColor.white}
      >
        {isNewProjectPage && (
          <Accordion.Item id="steps">
            <ProjectConfigFormSteps />
          </Accordion.Item>
        )}
        <Accordion.Item id="publication" position="relative">
          <ProjectConfigFormPublication locales={locales} project={project} />
        </Accordion.Item>
        <Accordion.Item id="access">
          <ProjectConfigFormAccess isAdmin={query?.viewer?.isAdmin || false} />
        </Accordion.Item>
        <Accordion.Item id="parameters">
          <ProjectConfigFormParameters project={project} />
        </Accordion.Item>
      </Accordion>
      <ProjectConfigFormExternal />
    </>
  )
}

export default ProjectConfigFormSide
