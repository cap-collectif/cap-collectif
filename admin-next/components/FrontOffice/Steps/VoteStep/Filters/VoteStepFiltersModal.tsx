import { Button, CapUIIcon, CapUIModalSize, Flex, Heading, Modal } from '@cap-collectif/ui'
import { useDisclosure } from '@liinkiing/react-hooks'
import { parseAsString, useQueryStates } from 'nuqs'
import { useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { filtersToUrlParams, getActiveFiltersCount, getDefaultAccordions, urlFiltersToLocalState } from './utils'
import useVoteStepFilters, { DEFAULT_FILTERS, FilterState } from './useVoteStepFilters'
import VoteStepFiltersAccordions from './VoteStepFiltersAccordions'

type Props = {
  stepId: string
}

const VoteStepFiltersModal: React.FC<Props> = ({ stepId }) => {
  const intl = useIntl()
  const { filters, totalCount } = useVoteStepFilters(stepId)

  const { isOpen, onOpen, onClose } = useDisclosure(false)

  const [urlFilters, setFilters] = useQueryStates(
    {
      sort: parseAsString.withDefault(DEFAULT_FILTERS.sort),
      category: parseAsString.withDefault(DEFAULT_FILTERS.category),
      theme: parseAsString.withDefault(DEFAULT_FILTERS.theme),
      status: parseAsString.withDefault(DEFAULT_FILTERS.status),
      userType: parseAsString.withDefault(DEFAULT_FILTERS.userType),
      district: parseAsString.withDefault(DEFAULT_FILTERS.district),
      contributor: parseAsString.withDefault(DEFAULT_FILTERS.contributor),
      term: parseAsString,
      latlng: parseAsString,
      latlngBounds: parseAsString,
    },
    { history: 'push' },
  )

  const [localFilters, setLocalFilters] = useState<FilterState>(urlFiltersToLocalState(urlFilters))

  // Sync local filters with URL filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(urlFiltersToLocalState(urlFilters))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const applyFilters = () => {
    setFilters(filtersToUrlParams(localFilters))
    onClose()
  }

  const handleReset = () => {
    setFilters(filtersToUrlParams(DEFAULT_FILTERS))
    onClose()
  }

  const handleCancel = () => {
    setLocalFilters(urlFiltersToLocalState(urlFilters))
    onClose()
  }

  const activeFiltersCount = getActiveFiltersCount(urlFilters)

  // Currently active filters determine which accordions are open by default
  const defaultAccordions = useMemo(() => getDefaultAccordions(urlFilters), [urlFilters])

  return (
    <>
      <Button variant="tertiary" leftIcon={CapUIIcon.Filter} onClick={onOpen}>
        {activeFiltersCount > 0
          ? `${intl.formatMessage({ id: 'btn_filter' })} (${activeFiltersCount})`
          : intl.formatMessage({ id: 'btn_filter' })}
      </Button>

      <Modal
        show={isOpen}
        onClose={onClose}
        id="modal-section-contributors"
        ariaLabel={intl.formatMessage({ id: 'vote.step.filter_project' })}
        size={CapUIModalSize.Xl}
      >
        <Modal.Header>
          <Heading as="h4" color="blue.900">
            {intl.formatMessage({ id: 'front.collect-vote-step.filter-n-proposals' }, { n: totalCount })}
          </Heading>
        </Modal.Header>

        <Modal.Body spacing={5}>
          <VoteStepFiltersAccordions
            filters={filters}
            currentFilters={localFilters}
            onFilterChange={handleFilterChange}
            defaultAccordions={defaultAccordions}
          />
        </Modal.Body>

        <Modal.Footer>
          <Flex justifyContent="flex-end" gap="lg" width="100%">
            <Button
              variant="tertiary"
              variantColor="primary"
              variantSize="medium"
              ml="0"
              mr="auto"
              onClick={handleCancel}
            >
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
    </>
  )
}

export default VoteStepFiltersModal
