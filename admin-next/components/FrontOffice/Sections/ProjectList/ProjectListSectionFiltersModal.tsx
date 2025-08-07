import {
  Button,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  FormLabel,
  Heading,
  Icon,
  Modal,
  Radio,
  RadioGroup,
} from '@cap-collectif/ui'
import { ProjectListSectionFiltersModal_query$key } from '@relay/ProjectListSectionFiltersModal_query.graphql'
import { ChangeEvent, FC, useState } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'

const FUTURE = '0'
const OPENED = '1'
const OPENED_PARTICIPATION = '2'
const CLOSED = '3'

type FiltersProps = {
  type: string
  setType: (type: string) => void
  state: string
  setState: (state: string) => void
  district: string
  setDistrict: (district: string) => void
  status: string
  setStatus: (status: string) => void
  orderBy: string
  setOrderBy: (orderBy: string) => void
}

const FRAGMENT = graphql`
  fragment ProjectListSectionFiltersModal_query on Query {
    projectTypes(onlyUsedByProjects: true) {
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

export const FilterRadioGroup = ({ options, name, label, value, setValue }) => {
  return (
    <Flex direction="column" gap="xs">
      <FormLabel label={label} />
      <RadioGroup>
        {options.map(choice => (
          <Flex alignItems="center" key={choice.value}>
            <Radio
              id={choice.value === '' ? `${name}-all` : `${name}-${choice.value}`}
              name={name}
              value={choice.value}
              checked={choice.value === value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
            >
              {choice?.label}
            </Radio>
          </Flex>
        ))}
      </RadioGroup>
    </Flex>
  )
}

const ProjectListSectionFiltersModal: FC<
  FiltersProps & {
    query: ProjectListSectionFiltersModal_query$key
  }
> = ({
  orderBy,
  setOrderBy,
  type,
  setType,
  state,
  setState,
  district,
  setDistrict,
  status,
  setStatus,
  query: queryKey,
}) => {
  const intl = useIntl()
  const { projectsCount, projectTypes: projectTypesQuery, globalDistricts } = useFragment(FRAGMENT, queryKey)
  const [orderByInternal, setOrderByInternal] = useState(orderBy)
  const [typeInternal, setTypeInternal] = useState(type)
  const [statusInternal, setStatusInternal] = useState(status)
  const [districtInternal, setDistrictInternal] = useState(district)
  const [stateInternal, setStateInternal] = useState(state)

  if (!projectsCount.totalCount) return null

  const projectTypes = projectTypesQuery.map(v => ({ ...v, label: intl.formatMessage({ id: v.label }) }))
  const districts = globalDistricts.edges.map(({ node }) => node)
  const hasTypes = !!projectTypes.length
  const hasDistricts = !!globalDistricts.totalCount

  const ALL = {
    value: '',
    label: intl.formatMessage({ id: 'global.all' }),
  }

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
    ALL,
    {
      value: FUTURE,
      label: intl.formatMessage({ id: 'ongoing-and-future' }),
    },
    {
      value: OPENED,
      label: intl.formatMessage({ id: 'step.status.open' }),
    },
    {
      value: OPENED_PARTICIPATION,
      label: intl.formatMessage({ id: 'step.status.open.participation' }),
    },
    {
      value: CLOSED,
      label: intl.formatMessage({ id: 'step.status.closed' }),
    },
  ]

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

  return (
    <Modal
      size={CapUIModalSize.Md}
      fullSizeOnMobile
      ariaLabel={intl.formatMessage({ id: 'global.more_filters' })}
      onClose={() => {
        setOrderByInternal(orderBy)
        setTypeInternal(type)
        setStateInternal(state)
        setDistrictInternal(district)
        setStatusInternal(status)
      }}
      disclosure={
        <Flex
          id="project-button-filter"
          as="button"
          type="button"
          pl={3}
          pr={2}
          py="xs"
          alignItems="center"
          borderRadius="button"
          border="button"
          borderColor="gray.300"
          spacing={1}
          justifyContent="center"
          color="gray.900"
          width={['100%', 'auto']}
        >
          <div>{intl.formatMessage({ id: 'global.more_filters' })}</div>
          <Icon name={CapUIIcon.ArrowDown} size={CapUIIconSize.Sm} color="gray.700" />
        </Flex>
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
            <Heading>{intl.formatMessage({ id: 'global.more_filters' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Flex gap={4} direction="column">
              <FilterRadioGroup
                label={intl.formatMessage({ id: 'sort-by' })}
                name="orderBy"
                options={orderByOptions}
                value={orderByInternal}
                setValue={setOrderByInternal}
              />
              {hasTypes ? (
                <FilterRadioGroup
                  label={intl.formatMessage({ id: 'admin.label.pages.types' })}
                  name="type"
                  options={[ALL, ...projectTypes]}
                  value={typeInternal}
                  setValue={setTypeInternal}
                />
              ) : null}
              <FilterRadioGroup
                label={intl.formatMessage({ id: 'global.status' })}
                name="status"
                options={statusesOptions}
                value={statusInternal}
                setValue={setStatusInternal}
              />
              {hasDistricts ? (
                <FilterRadioGroup
                  label={intl.formatMessage({ id: 'global.zones' })}
                  name="district"
                  options={[ALL, ...districts]}
                  value={districtInternal}
                  setValue={setDistrictInternal}
                />
              ) : null}
              <FilterRadioGroup
                label={intl.formatMessage({ id: 'global.state' })}
                name="state"
                options={stateOptions}
                value={stateInternal}
                setValue={setStateInternal}
              />
            </Flex>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" variantColor="primary" variantSize="big" onClick={hide}>
              {intl.formatMessage({ id: 'cancel' })}
            </Button>
            <Button
              id="apply-project-filters-button"
              variant="primary"
              variantColor="primary"
              variantSize="big"
              onClick={() => {
                if (orderByInternal !== orderBy) setOrderBy(orderByInternal)
                if (typeInternal !== type) setType(typeInternal)
                if (statusInternal !== status) setStatus(statusInternal)
                if (districtInternal !== district) setDistrict(districtInternal)
                if (stateInternal !== state) setState(stateInternal)
                hide()
              }}
            >
              {intl.formatMessage({ id: 'global.apply' })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default ProjectListSectionFiltersModal
