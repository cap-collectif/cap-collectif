import { BoxProps, CapUIIcon, CapUIIconSize, Flex, Icon, Popover, Search, Select } from '@cap-collectif/ui'
import { ProjectListSectionFilters_query$key } from '@relay/ProjectListSectionFilters_query.graphql'
import { ProjectListSectionFiltersPopover_query$key } from '@relay/ProjectListSectionFiltersPopover_query.graphql'
import debounce from '@shared/utils/debounce-promise'
import { FC, Suspense } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'

const FUTURE = '0'
const OPENED = '1'
const CLOSED = '2'

type FiltersProps = {
  author: string
  setAuthor: (author: string) => void
  type: string
  setType: (type: string) => void
  state: string
  setState: (state: string) => void
  theme: string
  setTheme: (theme: string) => void
  district: string
  setDistrict: (district: string) => void
  status: string
  setStatus: (status: string) => void
}

type ProjectListSectionFiltersProps = {
  term: string
  setTerm: (term: string) => void
  orderBy: string
  setOrderBy: (orderBy: string) => void
  query: ProjectListSectionFilters_query$key
} & FiltersProps

const FRAGMENT = graphql`
  fragment ProjectListSectionFiltersPopover_query on Query {
    projectTypes(onlyUsedByProjects: true) {
      value: id
      label: title
    }
    projectAuthors {
      value: id
      label: username
    }
    themes {
      value: id
      label: title
    }
    globalDistricts {
      totalCount
      edges {
        node {
          value: id
          label: name
        }
      }
    }
    projectsCount: projects {
      totalCount
    }
  }
`

const FiltersPopover: FC<FiltersProps & { query: ProjectListSectionFiltersPopover_query$key }> = ({
  author,
  setAuthor,
  type,
  setType,
  state,
  setState,
  theme,
  setTheme,
  district,
  setDistrict,
  status,
  setStatus,
  query: queryKey,
}) => {
  const intl = useIntl()
  const {
    projectsCount,
    themes,
    projectAuthors,
    projectTypes: projectTypesQuery,
    globalDistricts,
  } = useFragment(FRAGMENT, queryKey)

  if (!projectsCount.totalCount) return null

  const projectTypes = projectTypesQuery.map(v => ({ ...v, label: intl.formatMessage({ id: v.label }) }))
  const districts = globalDistricts.edges.map(({ node }) => node)
  const hasAuthors = !!projectAuthors.length
  const hasTypes = !!projectTypes.length
  const hasThemes = !!themes.length
  const hasDistricts = !!globalDistricts.totalCount

  const stateOptions = [
    {
      value: 'ARCHIVED',
      label: intl.formatMessage({ id: 'archived-projects' }),
    },
    {
      value: 'ACTIVE',
      label: intl.formatMessage({ id: 'active-projects' }),
    },
  ]

  const statusesOptions = [
    {
      value: FUTURE,
      label: intl.formatMessage({ id: 'ongoing-and-future' }),
    },
    {
      value: OPENED,
      label: intl.formatMessage({ id: 'step.status.open' }),
    },
    {
      value: CLOSED,
      label: intl.formatMessage({ id: 'step.status.closed' }),
    },
  ]

  return (
    <Popover
      placement="bottom"
      aria-label={intl.formatMessage({ id: 'link_filters' })}
      // @ts-ignore TODO : Rework popover component
      popoverProps={{ style: { zIndex: 1000 } }}
      disclosure={
        <Flex
          id="project-button-filter"
          as="button"
          type="button"
          pl={3}
          pr={2}
          py={1}
          alignItems="center"
          borderRadius="button"
          border="button"
          borderColor="gray.300"
          spacing={1}
          color="gray.900"
        >
          <div>{intl.formatMessage({ id: 'label_filters' })}</div>
          <Icon name={CapUIIcon.ArrowDown} size={CapUIIconSize.Sm} color="gray.700" />
        </Flex>
      }
    >
      <Flex gap={4} direction="column">
        {hasTypes ? (
          <Select
            isClearable
            value={projectTypes.find(v => v?.value === type)}
            options={projectTypes}
            onChange={v => setType(v?.value || '')}
            id="project-type"
            placeholder={intl.formatMessage({
              id: 'project',
            })}
          />
        ) : null}
        {hasThemes ? (
          <Select
            isClearable
            value={themes.find(v => v?.value === theme)}
            options={themes}
            onChange={v => setTheme(v?.value || '')}
            id="project-theme"
            placeholder={intl.formatMessage({
              id: 'proposal.theme',
            })}
          />
        ) : null}
        {hasAuthors ? (
          <Select
            isClearable
            value={projectAuthors.find(v => v?.value === author)}
            options={projectAuthors}
            onChange={v => setAuthor(v?.value || '')}
            id="project-author"
            placeholder={intl.formatMessage({
              id: 'global.author',
            })}
          />
        ) : null}
        <Select
          isClearable
          value={statusesOptions.find(v => v?.value === status)}
          options={statusesOptions}
          onChange={v => setStatus(v?.value || '')}
          id="project-status"
          placeholder={intl.formatMessage({
            id: 'admin.fields.theme.status',
          })}
        />
        {hasDistricts ? (
          <Select
            isClearable
            value={districts.find(v => v?.value === district)}
            options={districts}
            onChange={v => setDistrict(v?.value || '')}
            id="project-district"
            placeholder={intl.formatMessage({
              id: 'global.select_districts',
            })}
          />
        ) : null}
        <Select
          // @ts-expect-error fix DS BEFORE MERGING
          deleteButtonAriaLabel={intl.formatMessage({ id: 'aria.delete-text' })}
          isClearable
          value={stateOptions.find(v => v?.value === state)}
          options={stateOptions}
          onChange={v => setState(v?.value || '')}
          id="project-state"
          placeholder={intl.formatMessage({
            id: 'global.state',
          })}
        />
      </Flex>
    </Popover>
  )
}

const FILTERS_FRAGMENT = graphql`
  fragment ProjectListSectionFilters_query on Query {
    ...ProjectListSectionFiltersPopover_query
  }
`

export const ProjectListSectionFilters: FC<BoxProps & ProjectListSectionFiltersProps> = ({
  term,
  setTerm,
  orderBy,
  setOrderBy,
  author,
  setAuthor,
  type,
  setType,
  state,
  setState,
  theme,
  setTheme,
  district,
  setDistrict,
  status,
  setStatus,
  query: queryKey,
  ...rest
}) => {
  const query = useFragment(FILTERS_FRAGMENT, queryKey)
  const intl = useIntl()

  const orderByOptions = [
    {
      value: 'PUBLISHED_AT',
      label: intl.formatMessage({
        id: 'opinion.sort.last',
      }),
    },
    {
      value: 'POPULAR',
      label: intl.formatMessage({
        id: 'argument.sort.popularity',
      }),
    },
  ]

  const onTermChange = debounce((value: string) => {
    setTerm(value)
  }, 1000)

  return (
    <Flex
      className="project-list-section-filters"
      alignItems={['start', 'center']}
      justifyContent="space-between"
      mt={8}
      flexDirection={['column', 'row']}
      {...rest}
    >
      <Flex gap={4} mb={[4, 0]} flexWrap="wrap">
        <Select
          value={orderByOptions.find(v => v.value === orderBy) || orderByOptions[0]}
          width="14rem"
          placeholder={intl.formatMessage({ id: 'opinion.sort.last' })}
          onChange={v => setOrderBy(v?.value || 'PUBLISHED_AT')}
          options={orderByOptions}
        />
        <Suspense fallback={null}>
          <FiltersPopover
            author={author}
            setAuthor={setAuthor}
            type={type}
            setType={setType}
            state={state}
            setState={setState}
            theme={theme}
            setTheme={setTheme}
            district={district}
            setDistrict={setDistrict}
            status={status}
            setStatus={setStatus}
            query={query}
          />
        </Suspense>
      </Flex>
      <Search placeholder={intl.formatMessage({ id: 'global.menu.search' })} onChange={onTermChange} value={term} />
    </Flex>
  )
}
