'use client'

import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import PageHeading from '@components/FrontOffice/PageHeading/PageHeading'
import ProjectListSection from '@components/FrontOffice/Sections/ProjectList/ProjectListSection'
import { FC, Suspense, useEffect } from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { evalCustomCode } from 'src/app/custom-code'
import { GlobalFrontOfficeCKEDITORStyles } from 'src/app/styles'
import { ProjectsListQuery } from '@relay/ProjectsListQuery.graphql'
import { Spinner } from '@cap-collectif/ui'
import useUrlState from '@hooks/useUrlState'
import { ProjectArchiveFilter, ProjectOrderField } from '@relay/ProjectListSectionQuery.graphql'

type Props = {
  title: string
  body: string
  customCode?: string
  pagination?: number
}

const projectsQuery = graphql`
  query ProjectsListQuery(
    $count: Int
    $term: String
    $orderBy: ProjectOrder
    $author: ID
    $theme: ID
    $type: ID
    $district: ID
    $status: ID
    $onlyPublic: Boolean
    $archived: ProjectArchiveFilter
  ) {
    ...ProjectListSection_query
      @arguments(
        count: $count
        author: $author
        theme: $theme
        orderBy: $orderBy
        type: $type
        district: $district
        status: $status
        term: $term
        onlyPublic: $onlyPublic
        archived: $archived
      )
  }
`

export const ProjectsRender: FC<{ pagination?: number }> = ({ pagination }) => {
  const [term, setTerm] = useUrlState('term', '')
  const [author, setAuthor] = useUrlState('author', '')
  const [type, setType] = useUrlState('type', '')
  const [orderBy, setOrderBy] = useUrlState('orderBy', '')
  const [state, setState] = useUrlState('state', 'ACTIVE')
  const [theme, setTheme] = useUrlState('theme', '')
  const [district, setDistrict] = useUrlState('district', '')
  const [status, setStatus] = useUrlState('status', '')
  const orderByFilter: ProjectOrderField = ['PUBLISHED_AT', 'POPULAR'].includes(orderBy)
    ? (orderBy as ProjectOrderField)
    : ('PUBLISHED_AT' as ProjectOrderField)
  const stateFilter: ProjectArchiveFilter = !['ARCHIVED', 'ACTIVE'].includes(state)
    ? null
    : (state as ProjectArchiveFilter)

  const query = useLazyLoadQuery<ProjectsListQuery>(projectsQuery, {
    count: pagination || 20,
    term,
    author,
    type,
    orderBy: { direction: 'DESC', field: orderByFilter },
    theme,
    status,
    district,
    archived: stateFilter,
  })

  return (
    <ProjectListSection
      query={query}
      term={term}
      setTerm={setTerm}
      orderBy={orderBy || 'PUBLISHED_AT'}
      setOrderBy={setOrderBy}
      author={author}
      setAuthor={setAuthor}
      type={type}
      setType={setType}
      state={stateFilter}
      setState={setState}
      theme={theme}
      setTheme={setTheme}
      district={district}
      setDistrict={setDistrict}
      status={status}
      setStatus={setStatus}
      orderByFilter={orderByFilter}
    />
  )
}

export const Projects: FC<Props> = ({ title, body, customCode, pagination }) => {
  const { siteColors } = useAppContext()

  useEffect(() => {
    evalCustomCode(customCode)
  }, [customCode])

  return (
    <>
      <GlobalFrontOfficeCKEDITORStyles {...siteColors} />
      <PageHeading title={title} subtitle={body} />
      <Suspense fallback={<Spinner m="auto" my="10rem" />}>
        <ProjectsRender pagination={pagination} />
      </Suspense>
    </>
  )
}

export default Projects
