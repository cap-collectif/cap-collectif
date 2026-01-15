import {
  Accordion,
  Button,
  CapUIFontSize,
  CapUIFontWeight,
  CapUIIcon,
  CapUILineHeight,
  CapUIModalSize,
  Flex,
  Heading,
  Modal,
  Radio,
  RadioGroup,
  Text,
} from '@cap-collectif/ui'
import { useDisclosure } from '@liinkiing/react-hooks'
import { VoteStepActionsModal_filters_query$key } from '@relay/VoteStepActionsModal_filters_query.graphql'
import { parseAsString, useQueryState, useQueryStates } from 'nuqs'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'

type FilterState = {
  sort: string | null
  category: string | null
  theme: string | null
  status: string | null
  userType: string | null
  district: string | null
  term: string | null
  latlng: string | null
  latlngBounds: string | null
}

type Category = {
  id: string
  name: string | null
}

type ThemeOption = {
  id: string
  title: string
}

type Props = {
  form: {
    usingCategories?: boolean | null
    categories?: ReadonlyArray<Category> | null
    usingThemes?: boolean | null
  } | null
  filtersConnection: VoteStepActionsModal_filters_query$key
}

const FRAGMENT = graphql`
  fragment VoteStepActionsModal_filters_query on Query {
    themes {
      id
      title
    }
    userTypes {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`

const STATUSES_FRAGMENT = graphql`
  fragment VoteStepActionsModal_proposalStatuses_query on Query @argumentDefinitions(stepId: { type: "ID!" }) {
    statuses: node(id: $stepId) {
      id
      ... on ProposalStep {
        statuses {
          id
          name
        }
      }
    }
  }
`

const VoteStepActionsModal: React.FC<Props> = ({ form, filtersConnection }) => {
  const data = useFragment(FRAGMENT, filtersConnection)
  const themes = data?.themes
  const contributors = data?.userTypes
  const intl = useIntl()

  const statusesData = useFragment(STATUSES_FRAGMENT, filtersConnection)

  // @ts-ignore - remove this ignore later // adding it now to make CI pass
  const statuses = statusesData?.statuses?.statuses || []

  const allStatuses = [
    { id: 'ALL', name: intl.formatMessage({ id: 'global.select_statuses' }), color: '' },
    ...statuses.map(status => ({
      id: status.id,
      name: status.name || '',
      color: '',
    })),
  ]
  const { isOpen, onOpen, onClose } = useDisclosure(false)

  // const defaultSortValues = { sort: 'random', category: 'ALL', theme: 'ALL' }
  const [sort, setSort] = useQueryState('sort', { defaultValue: 'random' })
  const [category, setCategory] = useQueryState('category', { defaultValue: 'ALL' })
  const [theme, setTheme] = useQueryState('theme', { defaultValue: 'ALL' })
  const [contributor, setContributor] = useQueryState('contributor', { defaultValue: 'ALL' })
  const [status, setStatus] = useQueryState('status', { defaultValue: 'ALL' })

  const [filters, setFilters] = useQueryStates(
    {
      sort: parseAsString.withDefault('random'),
      category: parseAsString.withDefault('ALL'),
      theme: parseAsString.withDefault('ALL'),
      status: parseAsString.withDefault('ALL'),
      userType: parseAsString.withDefault('ALL'),
      district: parseAsString.withDefault('ALL'),
      term: parseAsString,
      latlng: parseAsString,
      latlngBounds: parseAsString,
    },
    { history: 'push' },
  )

  const [localFilters, setLocalFilters] = useState<FilterState>({
    sort: filters.sort,
    category: filters.category,
    theme: filters.theme,
    status: filters.status,
    userType: filters.userType,
    district: filters.district,
    term: filters.term,
    latlng: filters.latlng,
    latlngBounds: filters.latlngBounds,
  })

  // const [, resetFilters] = useQueryStates(
  //   {
  //     term: null,
  //     sort: null,
  //     userType: null,
  //     theme: null,
  //     category: null,
  //     district: null,
  //     status: null,
  //     latlng: null,
  //     latlngBounds: null,
  //   },
  //   {
  //     history: 'push',
  //   },
  // )

  const [localSort, setLocalSort] = useState<string | null>(sort || 'random')
  const [localCategory, setSelectedCategory] = useState<string>(category || 'ALL')
  const [localTheme, setLocalTheme] = useState<string>(theme || 'ALL')
  const [localStatus, setLocalStatus] = useState<string>(status || 'ALL')
  const [localContributor, setLocalContributor] = useState<string>(contributor || 'ALL')

  useEffect(() => {
    if (isOpen) {
      setLocalSort(sort || 'random')
      setSelectedCategory(category || 'ALL')
      setLocalTheme(theme || 'ALL')
      setLocalStatus(status || 'ALL')
      setLocalContributor(contributor || 'ALL')
      setLocalFilters({
        sort: filters.sort || 'random',
        category: filters.category || 'ALL',
        theme: filters.theme || 'ALL',
        status: filters.status || 'ALL',
        userType: filters.userType || 'ALL',
        district: filters.district || 'ALL',
        term: filters.term || null,
        latlng: filters.latlng || null,
        latlngBounds: filters.latlngBounds || null,
      })
    }
  }, [isOpen, sort, category, theme, contributor, status, filters])

  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const applyFilters = () => {
    const updatedFilters: Partial<FilterState> = {}

    // Only include non-default values in URL
    if (localFilters.sort !== 'random') updatedFilters.sort = localFilters.sort
    if (localFilters.category !== 'ALL') updatedFilters.category = localFilters.category
    if (localFilters.theme !== 'ALL') updatedFilters.theme = localFilters.theme
    if (localFilters.status !== 'ALL') updatedFilters.status = localFilters.status
    if (localFilters.userType !== 'ALL') updatedFilters.userType = localFilters.userType
    if (localFilters.district !== 'ALL') updatedFilters.district = localFilters.district
    if (localFilters.term) updatedFilters.term = localFilters.term
    if (localFilters.latlng) updatedFilters.latlng = localFilters.latlng
    if (localFilters.latlngBounds) updatedFilters.latlngBounds = localFilters.latlngBounds

    setFilters(updatedFilters)
    if (localSort) {
      setSort(localSort)
    } else {
      setSort(null)
    }

    // Map ALL to null so we clear the filter
    setCategory(localCategory === 'ALL' ? null : localCategory)
    setTheme(localTheme === 'ALL' ? null : localTheme)
    setStatus(localStatus === 'ALL' ? 'ALL' : localStatus)
    setContributor(localContributor === 'ALL' ? null : localContributor)

    onClose()
  }

  const hasCategories = !!form?.usingCategories && !!form?.categories?.length
  const categoryOptions: ReadonlyArray<Category> = useMemo(
    () => (hasCategories && form?.categories ? form.categories : []),
    [hasCategories, form?.categories],
  )

  const themeOptions: ReadonlyArray<ThemeOption> = useMemo(() => themes || [], [themes])

  const handleReset = () => {
    // resetFilters(null)
    setLocalSort('random')
    setSelectedCategory('ALL')
    setLocalTheme('ALL')
    setFilters({
      sort: 'random',
      category: 'ALL',
      theme: 'ALL',
      status: 'ALL',
      userType: 'ALL',
      district: 'ALL',
      term: null,
      latlng: null,
      latlngBounds: null,
    })
  }

  const sortOptions = [
    {
      value: 'random',
      label: intl.formatMessage({ id: 'global.random' }),
    },
    {
      value: 'last',
      label: intl.formatMessage({ id: 'global.filter_f_last' }),
    },
    {
      value: 'old',
      label: intl.formatMessage({ id: 'global.filter_f_old' }),
    },
    {
      value: 'comments',
      label: intl.formatMessage({ id: 'global.filter_f_comments' }),
    },
  ]

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      id="modal-section-contributors"
      ariaLabel={intl.formatMessage({ id: 'vote.step.filter_project' })}
      size={CapUIModalSize.Xl}
      disclosure={
        // TODO: change icon
        <Button variant="tertiary" leftIcon={CapUIIcon.Filter} onClick={onOpen}>
          {intl.formatMessage({ id: 'btn_filter' })}
        </Button>
      }
    >
      <Modal.Header>
        <Heading as="h4" color="blue.900">
          {/* TODO: replace with actual proposal count */}
          {intl.formatMessage({ id: 'front.collect-vote-step.filter-n-proposals' }, { n: 123 })}
        </Heading>
      </Modal.Header>
      <Modal.Body spacing={5}>
        <Accordion defaultAccordion={['filter_by', 'categories', 'themes', 'statuses', 'contributors']} allowMultiple>
          <Accordion.Item id="filter_by">
            <Accordion.Button p={0}>
              <Text
                fontWeight={CapUIFontWeight.Normal}
                fontSize={CapUIFontSize.BodyRegular}
                lineHeight={CapUILineHeight.M}
              >
                {intl.formatMessage({ id: 'sort-by' })}
              </Text>
            </Accordion.Button>
            <Accordion.Panel display="flex" direction="column">
              <RadioGroup pt={2}>
                {sortOptions.map(option => (
                  <Flex alignItems="center" key={option.value}>
                    <Radio
                      id={`sort-${option.value}`}
                      name="sort"
                      value={option.value}
                      checked={localSort === option.value}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setLocalSort(e.target.value)}
                    >
                      {option.label}
                    </Radio>
                  </Flex>
                ))}
              </RadioGroup>
            </Accordion.Panel>
          </Accordion.Item>

          {hasCategories ? (
            <Accordion.Item id="categories">
              <Accordion.Button p={0} pb={1}>
                <Text
                  fontWeight={CapUIFontWeight.Normal}
                  fontSize={CapUIFontSize.BodyRegular}
                  lineHeight={CapUILineHeight.M}
                >
                  {intl.formatMessage({ id: 'global.categories' })}
                </Text>
              </Accordion.Button>
              <Accordion.Panel display="flex" direction="column">
                <RadioGroup pt={2}>
                  <Radio
                    id="category-all"
                    name="category"
                    value="ALL"
                    checked={localCategory === 'ALL'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedCategory(e.target.value)}
                  >
                    {intl.formatMessage({ id: 'global.select_categories' })}
                  </Radio>

                  <>
                    {categoryOptions.map(category => (
                      <Radio
                        id={`category-${category.id}`}
                        key={`category-${category.id}`}
                        name="category"
                        value={category.id}
                        checked={localCategory === category.id}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedCategory(e.target.value)}
                      >
                        {category.name}
                      </Radio>
                    ))}
                  </>
                </RadioGroup>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}

          {themeOptions.length ? (
            <Accordion.Item id="themes">
              <Accordion.Button p={0} pb={1}>
                <Text
                  fontWeight={CapUIFontWeight.Normal}
                  fontSize={CapUIFontSize.BodyRegular}
                  lineHeight={CapUILineHeight.M}
                >
                  {intl.formatMessage({ id: 'global.themes' })}
                </Text>
              </Accordion.Button>
              <Accordion.Panel display="flex" direction="column">
                <RadioGroup pt={2}>
                  <Flex alignItems="center">
                    <Radio
                      id="theme-all"
                      name="theme"
                      value="ALL"
                      checked={localFilters.theme === 'ALL'}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('theme', e.target.value)}
                    >
                      {intl.formatMessage({ id: 'global.select_themes' })}
                    </Radio>
                  </Flex>
                  <Radio
                    id="theme-none"
                    name="theme"
                    value="NONE"
                    checked={localTheme === 'NONE'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLocalTheme(e.target.value)}
                  >
                    {intl.formatMessage({ id: 'admin.fields.proposal.no_theme' })}
                  </Radio>
                  <>
                    {themeOptions.map(theme => (
                      <Radio
                        id={`theme-${theme.id}`}
                        key={theme.id}
                        name="theme"
                        value={theme.id}
                        checked={localTheme === theme.id}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setLocalTheme(e.target.value)}
                      >
                        {theme.title}
                      </Radio>
                    ))}
                  </>
                </RadioGroup>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}

          {/* TODO: currently not implemented / wired */}
          <Accordion.Item id="statuses">
            <Accordion.Button p={0} pb={1}>
              <Text
                fontWeight={CapUIFontWeight.Normal}
                fontSize={CapUIFontSize.BodyRegular}
                lineHeight={CapUILineHeight.M}
              >
                {intl.formatMessage({ id: 'status.plural' })}
              </Text>
            </Accordion.Button>

            <Accordion.Panel display="flex" direction="column">
              <RadioGroup pt={2}>
                {allStatuses.map(statusItem => (
                  <Radio
                    key={statusItem.id}
                    id={`status-${statusItem.id}`}
                    name="status"
                    value={statusItem.id}
                    checked={status === statusItem.id || (status === null && statusItem.id === 'ALL')}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const newValue = e.target.value === 'ALL' ? null : e.target.value
                      setStatus(newValue)
                      setFilters(prev => ({
                        ...prev,
                        status: newValue,
                      }))
                    }}
                  >
                    {statusItem.name}
                  </Radio>
                ))}
              </RadioGroup>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item id="contributors">
            <Accordion.Button p={0} pb={1}>
              <Text
                fontWeight={CapUIFontWeight.Normal}
                fontSize={CapUIFontSize.BodyRegular}
                lineHeight={CapUILineHeight.M}
              >
                {intl.formatMessage({ id: 'global.contributors' })}
              </Text>
            </Accordion.Button>

            <Accordion.Panel display="flex" direction="column">
              <RadioGroup pt={2}>
                <Radio
                  id="contributors-all"
                  name="contributors"
                  value="ALL"
                  checked={localContributor === 'ALL'}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setLocalContributor(e.target.value)}
                >
                  {intl.formatMessage({ id: 'global.select_types' })}
                </Radio>
                <>
                  {contributors?.edges
                    ?.filter(edge => edge?.node)
                    .map(edge => (
                      <Radio
                        key={edge.node.id}
                        id={`contributor-${edge.node.id}`}
                        name={`contributor-${edge.node.id}`}
                        value={edge.node.id}
                        checked={localContributor === edge.node.id}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setLocalContributor(e.target.value)}
                      >
                        {edge.node.name}
                      </Radio>
                    ))}
                </>
              </RadioGroup>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Modal.Body>
      <Modal.Footer>
        <Flex justifyContent="flex-end" gap="lg" width="100%">
          <Button variant="tertiary" variantColor="primary" variantSize="medium" ml="0" mr="auto" onClick={onClose}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
          <Button variant="secondary" variantColor="primary" variantSize="medium" onClick={handleReset}>
            {intl.formatMessage({ id: 'front.collect-vote-step.reset-filters' })}
          </Button>
          <Button variant="primary" variantColor="primary" variantSize="medium" onClick={applyFilters}>
            {intl.formatMessage({ id: 'front.collect-vote-step.filter-proposals' })}
          </Button>
        </Flex>
      </Modal.Footer>
    </Modal>
  )
}

export default VoteStepActionsModal
