import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import Select from 'react-select'
import { change } from 'redux-form'
import { useDispatch } from 'react-redux'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import DraggableProjectCard from './DraggableProjectCard'
import Text from '~ui/Primitives/Text'
import AppBox from '~ui/Primitives/AppBox'
import type { HomePageProjectsSectionConfigurationPageDisplayCustom_query$key } from '~relay/HomePageProjectsSectionConfigurationPageDisplayCustom_query.graphql'
import { reorder } from '~/utils/dragNdrop'
import type { HomePageProjectsSectionConfigurationPageDisplayCustom_homePageProjectsSectionConfiguration$key } from '~relay/HomePageProjectsSectionConfigurationPageDisplayCustom_homePageProjectsSectionConfiguration.graphql'
const cardPlaceholder = (
  <svg width="747" height="89" viewBox="0 0 747 89" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="746" height="88" rx="7.5" fill="white" />
    <rect x="8" y="8" width="140" height="73" rx="4" fill="#F7F7F8" />
    <rect x="164" y="24.5" width="493" height="16" rx="4" fill="#F7F7F8" />
    <rect x="164" y="48.5" width="246.5" height="16" rx="4" fill="#F7F7F8" />
    <rect x="0.5" y="0.5" width="746" height="88" rx="7.5" stroke="#DADEE1" strokeDasharray="4 4" />
  </svg>
)
const allProjectsFragment = graphql`
  fragment HomePageProjectsSectionConfigurationPageDisplayCustom_query on Query {
    allProjects: projects(onlyPublic: true) {
      edges {
        node {
          id
          title
          cover {
            url
          }
        }
      }
    }
  }
`
const homePageProjectsSectionConfigurationFragment = graphql`
  fragment HomePageProjectsSectionConfigurationPageDisplayCustom_homePageProjectsSectionConfiguration on HomePageProjectsSectionConfiguration {
    projectsData: projects {
      edges {
        node {
          id
          title
          cover {
            url
          }
        }
      }
    }
  }
`
type Props = {
  readonly allProjectsFragmentRef: HomePageProjectsSectionConfigurationPageDisplayCustom_query$key
  readonly homePageProjectsSectionConfigurationFragmentRef: HomePageProjectsSectionConfigurationPageDisplayCustom_homePageProjectsSectionConfiguration$key
  readonly formName: string
  readonly maxProjectsDisplay: number
}
export type Project = {
  readonly id: string
  readonly value: string
  readonly label: string
  readonly cover:
    | {
        readonly url: string
      }
    | null
    | undefined
}
export type Projects = Array<Project>

function HomePageProjectsSectionConfigurationPageDisplayCustom({
  allProjectsFragmentRef,
  homePageProjectsSectionConfigurationFragmentRef,
  formName,
  maxProjectsDisplay,
}: Props) {
  const { allProjects } = useFragment(allProjectsFragment, allProjectsFragmentRef)
  const { projectsData } = useFragment(
    homePageProjectsSectionConfigurationFragment,
    homePageProjectsSectionConfigurationFragmentRef,
  )
  const options = allProjects?.edges?.map(edge => {
    const node = edge?.node
    return {
      id: node?.id,
      value: node?.title,
      label: node?.title,
      cover: node?.cover,
    }
  })
  const ref = useRef<typeof Select>()
  const dispatch = useDispatch()
  const intl = useIntl()
  const [projects, setProjects] = useState<Projects>([])
  const [error, setError] = useState<string | null>(null)
  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const onDragEnd = useCallback(
    result => {
      if (!result.destination) {
        return
      }

      const updatedItems = reorder(projects, result.source.index, result.destination.index)
      setProjects(updatedItems)
    },
    [projects],
  )

  const removeProject = (removedProjectId: string): void => {
    const updatedProjects = projects.filter(({ id }) => removedProjectId !== id)
    ref.current.state.value = updatedProjects
    setProjects(updatedProjects)
  }

  const customStyles = {
    multiValueLabel: () => {
      return {
        display: 'none',
      }
    },
    multiValueRemove: () => {
      return {
        display: 'none',
      }
    },
    clearIndicator: () => {
      return {
        display: 'none',
      }
    },
  }
  useEffect(() => {
    if (!projectsData?.edges) return
    const edges = projectsData.edges.filter(Boolean)
    const formattedProjects = edges.map(edge => {
      const project = edge?.node
      return {
        id: project?.id,
        value: project?.title,
        label: project?.title,
        cover: project?.cover,
      }
    })
    ref.current.state.value = formattedProjects
    setProjects(formattedProjects)
  }, [projectsData, formName, dispatch])
  useEffect(() => {
    if (projects.length >= maxProjectsDisplay) {
      setError(
        intl.formatMessage({
          id: 'nb.projects.limit.reached',
        }),
      )
      setIsDisabled(true)
      return
    }

    setError(null)
    setIsDisabled(false)
  }, [intl, projects.length, maxProjectsDisplay])
  useEffect(() => {
    const projectIds = projects.map(p => p.id)
    dispatch(change(formName, 'projects', projectIds))
  }, [projects, dispatch, formName])

  const onChange = items => {
    if (items.length > maxProjectsDisplay) {
      return
    }

    setProjects(items)
  }

  return (
    <>
      <Select
        options={options}
        isMulti
        onChange={onChange}
        ref={ref}
        styles={customStyles}
        isDisabled={isDisabled}
        placeholder={intl.formatMessage({
          id: 'search.by.project.title',
        })}
        noOptionsMessage={() =>
          intl.formatMessage({
            id: 'search.no.project.found',
          })
        }
      />
      {projects.length === 0 && <AppBox mt={4}>{cardPlaceholder}</AppBox>}
      {error && <Text color="gray.500">{error}</Text>}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-1" type="PROJECTS">
          {provided => (
            <div className="m-4" ref={provided.innerRef} {...provided.droppableProps}>
              {projects.map((project, index) => {
                return (
                  <DraggableProjectCard project={project} index={index} removeProject={removeProject} key={index} />
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  )
}

export default HomePageProjectsSectionConfigurationPageDisplayCustom
