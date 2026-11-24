import {
  Box,
  Button,
  CapUIFontSize,
  CapUIIcon,
  CapUIIconSize,
  CapUILineHeight,
  CapUIModalSize,
  Heading,
  Icon,
  Modal,
} from '@cap-collectif/ui'
import { useDisclosure } from '@liinkiing/react-hooks'
import useInertOutside from '@shared/hooks/useInertOutside'
import { parseAsString, useQueryStates } from 'nuqs'
import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { getDefaultAccordions } from './utils'
import useVoteStepFilters, { DEFAULT_FILTERS, FilterState } from './useVoteStepFilters'
import VoteStepFiltersAccordions from './VoteStepFiltersAccordions'
import VoteStepSearchBar from './VoteStepSearchBar'
import { getContributionObjectTypeTranslationKey } from '@shared/constants/proposalStepObjectType'

type Props = {
  stepId: string
  proposalsCount: number
  isActive?: boolean
  onButtonClick?: () => void
  onModalClose?: () => void
}

const VoteStepMobileFiltersModal: React.FC<Props> = ({
  stepId,
  proposalsCount,
  isActive = false,
  onButtonClick,
  onModalClose,
}) => {
  const intl = useIntl()
  const { filters, defaultSort, form } = useVoteStepFilters(stepId)
  const objectType = getContributionObjectTypeTranslationKey(form?.objectType)
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const [searchContainer, setSearchContainer] = useState<HTMLDivElement | null>(null)
  // The modal stays non-modal on mobile (CapUI behaviour) but covers the whole screen:
  // keep the keyboard and screen readers inside it, like a modal dialog
  useInertOutside(searchContainer, isOpen)

  const handleOpen = () => {
    onOpen()
    onButtonClick?.()
  }

  const [currentFilters, setFilters] = useQueryStates(
    {
      sort: parseAsString.withDefault(defaultSort),
      category: parseAsString.withDefault(DEFAULT_FILTERS.category),
      theme: parseAsString.withDefault(DEFAULT_FILTERS.theme),
      status: parseAsString.withDefault(DEFAULT_FILTERS.status),
      state: parseAsString.withDefault(DEFAULT_FILTERS.state),
      userType: parseAsString.withDefault(DEFAULT_FILTERS.userType),
      district: parseAsString.withDefault(DEFAULT_FILTERS.district),
      contributor: parseAsString.withDefault(DEFAULT_FILTERS.contributor),
      term: parseAsString,
      latlng: parseAsString,
      latlngBounds: parseAsString,
    },
    { history: 'push' },
  )

  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    setFilters(prev => ({
      ...prev,
      [key]: value !== DEFAULT_FILTERS[key] ? value : null,
    }))
  }

  const applyFilters = () => {
    onClose()
  }

  const handleClose = () => {
    onClose()
    onModalClose?.()
  }

  // Currently active filters determine which accordions are open by default
  const defaultAccordions = useMemo(() => getDefaultAccordions(currentFilters), [currentFilters])

  return (
    <>
      <Button
        variant={isActive ? 'primary' : 'tertiary'}
        flexDirection="column"
        flex="1 0 0"
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Icon name={CapUIIcon.Search} size={CapUIIconSize.Md} />
        <Box as="span" fontSize={CapUIFontSize.BodySmall} lineHeight={CapUILineHeight.S}>
          {intl.formatMessage({ id: 'global.search.label' })}
        </Box>
      </Button>

      <Modal
        show={isOpen}
        onClose={handleClose}
        size={CapUIModalSize.Fullscreen}
        height="100%"
        ariaLabel={intl.formatMessage({ id: `front.contribution.${objectType}.filter` })}
        fullSizeOnMobile
        alwaysOpenInPortal
        forceModalDialogToFalse
        // Leaving the modal with Tab must not close it (focus would go back to the page top)
        hideOnClickOutside={false}
      >
        <Modal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
          <Heading as="h4" color="blue.900">
            {intl.formatMessage({ id: `front.contribution.${objectType}.filter` })}
          </Heading>
        </Modal.Header>
        <Modal.Body spacing={5}>
          <Box pt={2} ref={setSearchContainer}>
            <VoteStepSearchBar proposalsCount={proposalsCount} objectType={form?.objectType} autoFocus={isOpen} />
          </Box>
          <Box mt="md">
            <VoteStepFiltersAccordions
              filters={filters}
              currentFilters={currentFilters}
              onFilterChange={handleFilterChange}
              defaultAccordions={defaultAccordions}
            />
          </Box>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" variantColor="primary" variantSize="medium" onClick={applyFilters}>
            {intl.formatMessage({ id: `front.contribution.${objectType}.filter-apply` })}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default VoteStepMobileFiltersModal
